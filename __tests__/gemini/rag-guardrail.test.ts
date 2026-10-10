/**
 * Gemini integration — guardrail tests
 *
 * Verifies the system prompt correctly instructs the model to:
 *   1. Answer only from context (not training data)
 *   2. Use the guardrail phrase for off-topic queries
 *   3. Never diagnose or give personal medical advice
 *   4. Pass through the guardrail text cleanly when model returns it
 *
 * MOCK: @google/generative-ai SDK + fetch for embeddings. No real API calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const MOCK_SDK_GENERATE_CONTENT = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function () {
    return {
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: MOCK_SDK_GENERATE_CONTENT,
      }),
    }
  }),
}))

const MOCK_EMBED_FETCH = vi.fn()

function makeEmbedFetchResponse(dim = 3072) {
  return {
    ok: true,
    text: async () => '',
    json: async () => ({
      embedding: { values: new Array(dim).fill(0.01) },
    }),
  }
}

// The exact guardrail response text defined in the route's system prompt
const GUARDRAIL_RESPONSE_TEXT =
  "I don't have specific information about that in my education content. Please consult a healthcare professional."

async function captureSystemInstruction(query: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  let capturedInstruction = ''

  vi.mocked(GoogleGenerativeAI).mockImplementationOnce(function () {
    return {
      getGenerativeModel: vi.fn().mockImplementation(
        (opts: { model: string; systemInstruction: string }) => {
          capturedInstruction = opts.systemInstruction ?? ''
          return { generateContent: MOCK_SDK_GENERATE_CONTENT }
        }
      ),
    }
  } as never)

  const { buildIndex } = await import('@/lib/rag/embedder')
  await buildIndex()

  const { POST } = await import('@/app/api/chat/public/route')
  await POST({ json: async () => ({ query, lang: 'en', history: [] }) } as never)

  return capturedInstruction
}

describe('RAG route — guardrail prompt construction', () => {
  beforeEach(() => {
    vi.resetModules()
    global.fetch = MOCK_EMBED_FETCH
    delete process.env.HUGGINGFACE_API_KEY
    delete process.env.OPENROUTER_API_KEY
    delete process.env.GROQ_API_KEY
    process.env.GEMINI_API_KEY = 'test-key-not-real'
    MOCK_EMBED_FETCH.mockResolvedValue(makeEmbedFetchResponse())
    MOCK_SDK_GENERATE_CONTENT.mockResolvedValue({
      response: { text: () => 'Test reply' },
    })
  })

  afterEach(() => {
    delete process.env.GEMINI_API_KEY
    vi.clearAllMocks()
  })

  it('system prompt instructs model to answer ONLY from provided context', async () => {
    const prompt = await captureSystemInstruction('What exercises help OA?')
    // The prompt must explicitly say "answer only from context" / "do not use training knowledge"
    expect(prompt).toMatch(/only.*context|only using.*context/i)
    expect(prompt).toMatch(/do not.*training|not.*training knowledge/i)
  })

  it('system prompt specifies the guardrail fallback phrase verbatim', async () => {
    const prompt = await captureSystemInstruction('What is the capital of France?')
    expect(prompt).toContain("I don't have specific information about that")
    expect(prompt).toMatch(/healthcare professional/i)
  })

  it('system prompt prohibits diagnosing conditions or giving personalised medical advice', async () => {
    const prompt = await captureSystemInstruction('Do I have OA?')
    expect(prompt).toMatch(/never diagnose|never.*diagnos/i)
    expect(prompt).toMatch(/personal.*advice|personalised.*medical/i)
  })

  it('when model returns guardrail text, route passes it through with 200 status', async () => {
    MOCK_SDK_GENERATE_CONTENT.mockResolvedValueOnce({
      response: { text: () => GUARDRAIL_RESPONSE_TEXT },
    })

    const { buildIndex } = await import('@/lib/rag/embedder')
    await buildIndex()

    const { POST } = await import('@/app/api/chat/public/route')
    const response = await POST({
      json: async () => ({
        query: 'What medication should I take for my knee?',
        lang: 'en',
        history: [],
      }),
    } as never)

    const body = await response.json()

    // Route must return 200 with the guardrail text — not an error
    expect(response.status).toBe(200)
    expect(body.role).toBe('assistant')
    expect(body.text).toBe(GUARDRAIL_RESPONSE_TEXT)
  })
})

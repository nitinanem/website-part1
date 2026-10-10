/**
 * Gemini integration — request construction tests
 *
 * Architecture:
 *   - Embedder (lib/rag/embedder.ts): uses raw fetch → gemini-embedding-001 endpoint
 *   - Route (app/api/chat/public/route.ts): uses @google/generative-ai SDK (new GoogleGenerativeAI(...))
 *
 * MOCK strategy:
 *   - global.fetch → mocked for embedding API calls (MOCK_EMBED_FETCH)
 *   - @google/generative-ai → module mock using vi.fn() so `new` works correctly
 *
 * NEVER calls the real Gemini API. Test suite passes with NO API key.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── MOCK: @google/generative-ai SDK ─────────────────────────────────────────────
// Must use vi.fn() (not arrow fn) because the route uses `new GoogleGenerativeAI(...)`
const MOCK_SDK_GENERATE_CONTENT = vi.fn()
const MOCK_GET_MODEL = vi.fn()

vi.mock('@google/generative-ai', () => {
  const GoogleGenerativeAI = vi.fn().mockImplementation(function () {
    return {
      getGenerativeModel: MOCK_GET_MODEL,
    }
  })
  return { GoogleGenerativeAI }
})

// ── MOCK fetch for embedding API calls ────────────────────────────────────────
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

describe('RAG route — request construction', () => {
  beforeEach(() => {
    vi.resetModules()
    global.fetch = MOCK_EMBED_FETCH
    delete process.env.HUGGINGFACE_API_KEY
    delete process.env.OPENROUTER_API_KEY
    delete process.env.GROQ_API_KEY
    process.env.GEMINI_API_KEY = 'test-key-not-real'

    MOCK_EMBED_FETCH.mockResolvedValue(makeEmbedFetchResponse())
    MOCK_SDK_GENERATE_CONTENT.mockResolvedValue({
      response: { text: () => 'Low-impact exercise is beneficial.' },
    })
    MOCK_GET_MODEL.mockReturnValue({ generateContent: MOCK_SDK_GENERATE_CONTENT })
  })

  afterEach(() => {
    delete process.env.GEMINI_API_KEY
    vi.clearAllMocks()
  })

  it('embedding calls use the gemini-embedding-001 model URL', async () => {
    const { buildIndex } = await import('@/lib/rag/embedder')
    await buildIndex()

    const embeddingCalls = MOCK_EMBED_FETCH.mock.calls.filter((call: any[]) =>
      typeof call[0] === 'string' && call[0].includes('embedContent'),
    )

    expect(embeddingCalls.length).toBeGreaterThan(0)
    for (const [url] of embeddingCalls) {
      expect(url).toContain('gemini-embedding-001')
    }
  })

  it('generateContent call uses the gemini-3.6-flash model', async () => {
    const { buildIndex } = await import('@/lib/rag/embedder')
    await buildIndex()

    const { POST } = await import('@/app/api/chat/public/route')
    await POST({ json: async () => ({ query: 'What exercises help OA?', lang: 'en', history: [] }) } as never)

    // getGenerativeModel was called with model: gemini-3.6-flash
    expect(MOCK_GET_MODEL).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-3.6-flash' }),
    )
  })

  it('system prompt contains OA-grounding "CONTEXT" and no-personal-advice instruction', async () => {
    let capturedSystemInstruction = ''
    MOCK_GET_MODEL.mockImplementationOnce((opts: { model: string; systemInstruction: string }) => {
      capturedSystemInstruction = opts.systemInstruction ?? ''
      return { generateContent: MOCK_SDK_GENERATE_CONTENT }
    })

    const { buildIndex } = await import('@/lib/rag/embedder')
    await buildIndex()

    const { POST } = await import('@/app/api/chat/public/route')
    await POST({ json: async () => ({ query: 'What is OA?', lang: 'en', history: [] }) } as never)

    expect(capturedSystemInstruction).toMatch(/osteoarthritis/i)
    expect(capturedSystemInstruction).toMatch(/CONTEXT/i)
    expect(capturedSystemInstruction).toMatch(/never diagnose|no.*personal.*advice/i)
  })

  it('user query is the final "user" role turn in contents passed to generateContent', async () => {
    let capturedContents: { role: string; parts: { text: string }[] }[] = []

    MOCK_SDK_GENERATE_CONTENT.mockImplementationOnce(
      (opts: { contents: { role: string; parts: { text: string }[] }[] }) => {
        capturedContents = opts.contents
        return { response: { text: () => 'reply' } }
      },
    )

    const { buildIndex } = await import('@/lib/rag/embedder')
    await buildIndex()

    const { POST } = await import('@/app/api/chat/public/route')
    await POST({
      json: async () => ({ query: 'Is swimming good for OA?', lang: 'en', history: [] }),
    } as never)

    const lastTurn = capturedContents[capturedContents.length - 1]
    expect(lastTurn.role).toBe('user')
    expect(lastTurn.parts[0].text).toBe('Is swimming good for OA?')
  })
})

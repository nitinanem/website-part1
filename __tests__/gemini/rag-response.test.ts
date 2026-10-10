/**
 * Gemini integration — response parsing and error handling tests
 *
 * MOCK strategy:
 *   - @google/generative-ai → module mock using vi.fn() so `new` works correctly
 *   - global.fetch → mocked for embedding API (MOCK_EMBED_FETCH)
 *
 * NEVER calls the real Gemini API.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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

async function callRoute(query = 'What is OA?') {
  const { buildIndex } = await import('@/lib/rag/embedder')
  await buildIndex()
  const { POST } = await import('@/app/api/chat/public/route')
  return POST({ json: async () => ({ query, lang: 'en', history: [] }) } as never)
}

describe('RAG route — response parsing', () => {
  beforeEach(() => {
    vi.resetModules()
    global.fetch = MOCK_EMBED_FETCH
    delete process.env.HUGGINGFACE_API_KEY
    delete process.env.OPENROUTER_API_KEY
    delete process.env.GROQ_API_KEY
    process.env.GEMINI_API_KEY = 'test-key-not-real'
    MOCK_EMBED_FETCH.mockResolvedValue(makeEmbedFetchResponse())
    MOCK_GET_MODEL.mockReturnValue({ generateContent: MOCK_SDK_GENERATE_CONTENT })
  })

  afterEach(() => {
    delete process.env.GEMINI_API_KEY
    vi.clearAllMocks()
  })

  it('normal text response → returns {id, role, text, sources}', async () => {
    MOCK_SDK_GENERATE_CONTENT.mockResolvedValueOnce({
      response: { text: () => 'Swimming is excellent for OA.' },
    })

    const response = await callRoute('What exercise helps?')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.role).toBe('assistant')
    expect(body.text).toBe('Swimming is excellent for OA.')
    expect(typeof body.id).toBe('string')
    expect(Array.isArray(body.sources)).toBe(true)
  })

  it('SDK throws (blocked / empty candidates) → 500 internal_error, not silent empty reply', async () => {
    MOCK_SDK_GENERATE_CONTENT.mockResolvedValueOnce({
      response: {
        text: () => {
          throw new Error('Response was blocked. No candidates returned.')
        },
      },
    })

    const response = await callRoute('test query')
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('internal_error')
  })

  it('SDK throws rate-limit error → 500 internal_error with non-empty message', async () => {
    MOCK_SDK_GENERATE_CONTENT.mockRejectedValueOnce(
      new Error('429 Resource has been exhausted (quota exceeded)'),
    )

    const response = await callRoute('test query')
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('internal_error')
    expect(typeof body.message).toBe('string')
    expect(body.message.length).toBeGreaterThan(0)
  })

  it('SDK throws network error → 500 internal_error (no unhandled exception)', async () => {
    MOCK_SDK_GENERATE_CONTENT.mockRejectedValueOnce(new Error('fetch failed: connection refused'))

    const response = await callRoute('test query')
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('internal_error')
  })
})

describe('RAG route — missing API key', () => {
  beforeEach(() => {
    vi.resetModules()
    global.fetch = MOCK_EMBED_FETCH
    MOCK_EMBED_FETCH.mockResolvedValue(makeEmbedFetchResponse())
    MOCK_GET_MODEL.mockReturnValue({ generateContent: MOCK_SDK_GENERATE_CONTENT })
    delete process.env.GEMINI_API_KEY
    delete process.env.HUGGINGFACE_API_KEY
    delete process.env.OPENROUTER_API_KEY
    delete process.env.GROQ_API_KEY
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 503 llm_not_configured when GEMINI_API_KEY is absent', async () => {
    const response = await callRoute('test query')
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.error).toBe('llm_not_configured')
  })
})

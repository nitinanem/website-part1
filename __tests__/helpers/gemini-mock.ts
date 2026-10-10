/**
 * Shared Vitest mock for @google/generative-ai SDK.
 *
 * Import this in any test file with:
 *   import { MOCK_GENERATE_CONTENT, MOCK_EMBED_CONTENT } from '@/__tests__/helpers/gemini-mock'
 *
 * Then customize the mock implementation per-test with:
 *   MOCK_GENERATE_CONTENT.mockResolvedValueOnce(...)
 *   MOCK_EMBED_CONTENT.mockResolvedValueOnce(...)
 */

import { vi } from 'vitest'

export const MOCK_GENERATE_CONTENT = vi.fn()
export const MOCK_EMBED_CONTENT = vi.fn()

/** Default embed response — returns 3072-dim zero vector */
export function makeDefaultEmbedResponse(dim = 3072) {
  return {
    embedding: { values: new Array(dim).fill(0) },
  }
}

/** Default successful generate response */
export function makeGenerateResponse(text = 'This is a helpful reply about OA.') {
  return {
    response: {
      text: () => text,
      candidates: [
        {
          content: { parts: [{ text }], role: 'model' },
          finishReason: 'STOP',
        },
      ],
    },
  }
}

/** Empty candidates (model blocked) — text() will throw */
export function makeBlockedResponse() {
  return {
    response: {
      text: () => {
        throw new Error('Response was blocked. No candidates returned.')
      },
      candidates: [],
    },
  }
}

/**
 * Mocks the @google/generative-ai SDK.
 * Call this at the top of test files before any imports of the route/embedder.
 *
 * Usage:
 *   vi.mock('@google/generative-ai', () => mockGeminiSDK())
 */
export function mockGeminiSDK() {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: MOCK_GENERATE_CONTENT,
        embedContent: MOCK_EMBED_CONTENT,
      }),
    })),
  }
}

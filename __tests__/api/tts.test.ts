import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('POST /api/tts — Sarvam AI Text-to-Speech Endpoint', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('returns 400 empty_text when text is missing or whitespace', async () => {
    const { POST } = await import('@/app/api/tts/route')
    const req = new NextRequest('http://localhost:3000/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: '   ' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('empty_text')
  })

  it('returns fallback: true when SARVAM_API_KEY is missing', async () => {
    delete process.env.SARVAM_API_KEY
    delete process.env.SARVAM_AI_API_KEY

    const { POST } = await import('@/app/api/tts/route')
    const req = new NextRequest('http://localhost:3000/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello, how is your joint pain today?', lang: 'en' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.fallback).toBe(true)
    expect(data.provider).toBe('browser')
  })

  it('calls Sarvam API with correct BCP-47 language codes and returns base64 audio', async () => {
    process.env.SARVAM_API_KEY = 'test-sarvam-key'

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        audios: ['UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='],
      }),
    })
    global.fetch = mockFetch

    const { POST } = await import('@/app/api/tts/route')

    // Test Hindi
    const reqHi = new NextRequest('http://localhost:3000/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: 'नमस्ते, आपका स्वागत है।', lang: 'hi' }),
    })
    const resHi = await POST(reqHi)
    expect(resHi.status).toBe(200)
    const dataHi = await resHi.json()
    expect(dataHi.provider).toBe('sarvam')
    expect(dataHi.language).toBe('hi-IN')
    expect(dataHi.audioBase64).toBeDefined()

    // Verify fetch payload
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sarvam.ai/text-to-speech',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'api-subscription-key': 'test-sarvam-key',
        }),
        body: expect.stringContaining('"target_language_code":"hi-IN"'),
      })
    )
  })

  it('maps all supported languages accurately (en, hi, bn, pa, as)', async () => {
    process.env.SARVAM_API_KEY = 'test-sarvam-key'

    const capturedBodies: any[] = []
    global.fetch = vi.fn().mockImplementation(async (_url, options) => {
      capturedBodies.push(JSON.parse(options.body))
      return {
        ok: true,
        status: 200,
        json: async () => ({ audios: ['MOCK_AUDIO_BASE64'] }),
      }
    })

    const { POST } = await import('@/app/api/tts/route')
    const languages = ['en', 'hi', 'bn', 'pa', 'as'] as const

    for (const lang of languages) {
      const req = new NextRequest('http://localhost:3000/api/tts', {
        method: 'POST',
        body: JSON.stringify({ text: 'Sample text for joint health', lang }),
      })
      await POST(req)
    }

    expect(capturedBodies[0].target_language_code).toBe('en-IN')
    expect(capturedBodies[1].target_language_code).toBe('hi-IN')
    expect(capturedBodies[2].target_language_code).toBe('bn-IN')
    expect(capturedBodies[3].target_language_code).toBe('pa-IN')
    expect(capturedBodies[4].target_language_code).toBe('as-IN')
  })

  it('gracefully returns fallback: true when Sarvam returns quota or upstream error', async () => {
    process.env.SARVAM_API_KEY = 'test-sarvam-key'

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: 'No credits available.', code: 'insufficient_quota_error' },
      }),
    })

    const { POST } = await import('@/app/api/tts/route')
    const req = new NextRequest('http://localhost:3000/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: 'Testing fallback on error', lang: 'hi' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.fallback).toBe(true)
    expect(data.provider).toBe('browser')
    expect(data.error).toContain('No credits available')
  })
})

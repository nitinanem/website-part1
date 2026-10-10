import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

describe('POST /api/voice/parse-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when transcript is missing', async () => {
    const { POST } = await import('@/app/api/voice/parse-intent/route')
    const req = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('detects navigation commands like repeat, next, submit', async () => {
    const { POST } = await import('@/app/api/voice/parse-intent/route')
    const req = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'दोबारा बोलो',
        language: 'hi',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.type).toBe('command')
    expect(data.command).toBe('repeat')
    expect(data.spokenConfirmation).toBeDefined()
  })

  it('parses age in Hindi words via fast rules', async () => {
    const { POST } = await import('@/app/api/voice/parse-intent/route')
    const req = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'मेरी उम्र पैंसठ साल है',
        currentStep: 'age',
        language: 'hi',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.type).toBe('age')
    expect(data.value).toBe(65)
    expect(data.spokenConfirmation).toContain('65')
  })

  it('parses gender via fast rules', async () => {
    const { POST } = await import('@/app/api/voice/parse-intent/route')
    const req = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'हम महिला हैं',
        currentStep: 'gender',
        language: 'hi',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.type).toBe('gender')
    expect(data.value).toBe('female')
  })

  it('shifts to Groq when Gemini fails', async () => {
    // Delete GEMINI_API_KEY so Gemini fails
    const oldGemini = process.env.GEMINI_API_KEY
    delete process.env.GEMINI_API_KEY
    process.env.GROQ_API_KEY = 'mock_groq_key'

    // Mock fetch for Groq API
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                type: 'age',
                value: 68,
                spokenConfirmation: 'Recorded age 68.',
              }),
            },
          },
        ],
      }),
    } as any)

    const { POST } = await import('@/app/api/voice/parse-intent/route')
    const req = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'I am sixty eight years old',
        currentStep: 'age',
        language: 'en',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.provider).toBe('groq')
    expect(data.value).toBe(68)

    // Restore
    global.fetch = originalFetch
    process.env.GEMINI_API_KEY = oldGemini
  })

  it('shifts to local voice agent engine when both Gemini and Groq fail', async () => {
    // Delete both API keys so both cloud layers fail
    const oldGemini = process.env.GEMINI_API_KEY
    const oldGroq = process.env.GROQ_API_KEY
    delete process.env.GEMINI_API_KEY
    delete process.env.GROQ_API_KEY

    const { POST } = await import('@/app/api/voice/parse-intent/route')
    const req = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'हाँ बहुत दर्द है',
        currentStep: 'q1',
        language: 'hi',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.provider).toBe('local_voice_agent')
    expect(data.value).toBe(true)

    // Restore
    process.env.GEMINI_API_KEY = oldGemini
    process.env.GROQ_API_KEY = oldGroq
  })

  it('parses Assamese age and screening answers with localized confirmations', async () => {
    const oldGemini = process.env.GEMINI_API_KEY
    const oldGroq = process.env.GROQ_API_KEY
    delete process.env.GEMINI_API_KEY
    delete process.env.GROQ_API_KEY

    const { POST } = await import('@/app/api/voice/parse-intent/route')

    // Test Assamese age with Indic digits
    const reqAge = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'মোৰ বয়স ৬২ বছৰ',
        currentStep: 'age',
        language: 'as',
      }),
    })
    const resAge = await POST(reqAge)
    expect(resAge.status).toBe(200)
    const dataAge = await resAge.json()
    expect(dataAge.type).toBe('age')
    expect(dataAge.value).toBe(62)
    expect(dataAge.spokenConfirmation).toContain('62 বছৰ')

    // Test Assamese negative response
    const reqNo = new NextRequest('http://localhost:3000/api/voice/parse-intent', {
      method: 'POST',
      body: JSON.stringify({
        transcript: 'নহয়',
        currentStep: 'q1',
        language: 'as',
      }),
    })
    const resNo = await POST(reqNo)
    expect(resNo.status).toBe(200)
    const dataNo = await resNo.json()
    expect(dataNo.type).toBe('boolean')
    expect(dataNo.value).toBe(false)
    expect(dataNo.spokenConfirmation).toContain('নহয়')

    // Restore
    process.env.GEMINI_API_KEY = oldGemini
    process.env.GROQ_API_KEY = oldGroq
  })
})

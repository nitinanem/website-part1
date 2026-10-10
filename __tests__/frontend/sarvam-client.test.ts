import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sarvam-client.ts — Audio & Fallback Engine', () => {
  const mockSpeak = vi.fn()
  const mockCancel = vi.fn()
  const mockPause = vi.fn()
  const mockResume = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    // Mock SpeechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: mockPause,
        resume: mockResume,
        speaking: false,
        getVoices: vi.fn().mockReturnValue([
          { lang: 'en-IN', name: 'Indian English' },
          { lang: 'hi-IN', name: 'Hindi India' },
          { lang: 'bn-IN', name: 'Bengali India' },
          { lang: 'pa-IN', name: 'Punjabi India' },
        ]),
      },
    })

    // Mock SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = class {
      text: string
      lang = 'en'
      rate = 1.0
      pitch = 1.0
      onend: any = null
      onerror: any = null
      constructor(text: string) {
        this.text = text
      }
    } as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to window.speechSynthesis when /api/tts returns fallback: true', async () => {
    // Mock /api/tts returning fallback
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fallback: true, provider: 'browser', error: 'No credits available.' }),
    })

    const { speakText } = await import('@/lib/tts/sarvam-client')
    await speakText('नमस्ते, आपका स्वागत है।', 'hi')

    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('नमस्ते, आपका स्वागत है।')
    expect(utterance.lang).toBe('hi-IN')
  })

  it('falls back to window.speechSynthesis when /api/tts encounters a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'))

    const { speakText } = await import('@/lib/tts/sarvam-client')
    await speakText('Hello world', 'en')

    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Hello world')
  })

  it('plays high-fidelity audio when /api/tts returns base64 audio data', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=',
        provider: 'sarvam',
        format: 'audio/wav',
      }),
    })

    const mockPlay = vi.fn().mockResolvedValue(undefined)
    const mockAudioPause = vi.fn()

    // Mock window.Audio constructor
    global.Audio = class {
      src = ''
      playbackRate = 1.0
      paused = true
      play = mockPlay
      pause = mockAudioPause
      addEventListener = vi.fn()
      removeEventListener = vi.fn()
    } as any

    const { speakText } = await import('@/lib/tts/sarvam-client')
    await speakText('Welcome to JointCare', 'en')

    expect(mockPlay).toHaveBeenCalled()
    expect(mockSpeak).not.toHaveBeenCalled()
  })

  it('correctly maps Bengali (bn) to bn-IN voice in browser fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fallback: true, provider: 'browser' }),
    })

    const { speakText } = await import('@/lib/tts/sarvam-client')
    await speakText('জয়েন্টকেয়ারে আপনাকে স্বাগতম।', 'bn')

    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[mockSpeak.mock.calls.length - 1][0]
    expect(utterance.text).toBe('জয়েন্টকেয়ারে আপনাকে স্বাগতম।')
    expect(utterance.voice?.lang).toBe('bn-IN')
  })

  it('correctly routes Assamese (as) to bn-IN phonetic voice when as-IN is absent in browser', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fallback: true, provider: 'browser' }),
    })

    const { speakText } = await import('@/lib/tts/sarvam-client')
    await speakText('জয়েন্টকেয়াৰলৈ আপোনাক স্বাগতম।', 'as')

    expect(mockSpeak).toHaveBeenCalled()
    const utterance = mockSpeak.mock.calls[mockSpeak.mock.calls.length - 1][0]
    expect(utterance.text).toBe('জয়েন্টকেয়াৰলৈ আপোনাক স্বাগতম।')
    // Fallback selects bn-IN voice because browsers lack native as-IN voice models
    expect(utterance.voice?.lang).toBe('bn-IN')
  })
})


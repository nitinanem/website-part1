import type { Language } from '@/lib/i18n/context'

// Browser speech synthesis locale fallbacks
const BROWSER_VOICE_PREFERENCES: Record<Language, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  hi: ['hi-IN', 'hi'],
  pa: ['pa-IN', 'pa-PK', 'pa', 'hi-IN'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
  as: ['as-IN', 'as', 'bn-IN', 'hi-IN'],
}

// In-memory cache for audio base64 data to minimize API consumption
const audioCache = new Map<string, string>()

let currentAudio: HTMLAudioElement | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null
let isPlaying = false

/**
 * Stops all currently active audio playback (both Sarvam HTMLAudio and Web Speech).
 */
export function stopAudio(): void {
  isPlaying = false

  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch {}
    currentAudio = null
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {}
  }
  currentUtterance = null
}

/**
 * Pauses active playback.
 */
export function pauseAudio(): void {
  if (currentAudio) {
    currentAudio.pause()
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause()
  }
  isPlaying = false
}

/**
 * Resumes active playback.
 */
export function resumeAudio(): void {
  if (currentAudio) {
    currentAudio.play().catch(console.warn)
    isPlaying = true
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume()
    isPlaying = true
  }
}

/**
 * Checks if audio or speech synthesis is currently active.
 */
export function isAudioPlaying(): boolean {
  if (currentAudio && !currentAudio.paused && !currentAudio.ended) {
    return true
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking
  }
  return isPlaying
}

/**
 * Fallback to browser SpeechSynthesis when Sarvam AI is offline or has exhausted credits.
 */
function speakWithBrowserSpeech(
  text: string,
  lang: Language,
  onEnd?: () => void,
  onError?: () => void,
  rate = 1.0,
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.()
    return
  }

  try {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = 1.0

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices()
    const preferredPrefixes = BROWSER_VOICE_PREFERENCES[lang] || ['en']

    let selectedVoice: SpeechSynthesisVoice | undefined
    for (const prefix of preferredPrefixes) {
      selectedVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(prefix.toLowerCase().replace('_', '-'))
      )
      if (selectedVoice) break
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    } else {
      utterance.lang = preferredPrefixes[0]
    }

    utterance.onend = () => {
      isPlaying = false
      onEnd?.()
    }

    utterance.onerror = (e) => {
      isPlaying = false
      if (e.error === 'interrupted' || e.error === 'canceled') {
        onEnd?.()
        return
      }
      console.warn('[Browser TTS error]:', e.error)
      onError?.()
    }

    currentUtterance = utterance
    isPlaying = true
    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.warn('[Browser TTS exception]:', err)
    isPlaying = false
    onError?.()
  }
}

/**
 * Speaks text using Sarvam AI Bulbul Text-to-Speech (with automatic caching and fallback).
 */
export async function speakText(
  text: string,
  lang: Language = 'en',
  onEnd?: () => void,
  onError?: () => void,
  rate = 1.0,
): Promise<void> {
  const cleanText = text.trim()
  if (!cleanText) {
    onEnd?.()
    return
  }

  stopAudio()
  isPlaying = true

  const cacheKey = `${lang}:${rate}:${cleanText}`

  // 1. Check in-memory audio cache
  let audioBase64 = audioCache.get(cacheKey)

  if (!audioBase64) {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, lang, pace: rate }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.audioBase64) {
          audioBase64 = data.audioBase64
          const format = data.format || 'audio/wav'
          const audioData = `data:${format};base64,${audioBase64}`
          
          // Cache up to 100 entries to prevent memory overflow
          if (audioCache.size > 100) {
            const firstKey = audioCache.keys().next().value
            if (firstKey) audioCache.delete(firstKey)
          }
          audioCache.set(cacheKey, audioData)
          
          // Reset audioBase64 to hold the full data URI
          audioBase64 = audioData
        }
      }
    } catch (fetchErr) {
      console.warn('[SarvamClient] Network error reaching /api/tts, using browser TTS:', fetchErr)
    }
  }

  // 2. Play high-fidelity Sarvam AI audio if available
  if (audioBase64) {
    try {
      const audioUrl = audioBase64.startsWith('data:') ? audioBase64 : `data:audio/wav;base64,${audioBase64}`
      const audio = new Audio(audioUrl)
      audio.playbackRate = rate
      currentAudio = audio

      audio.onended = () => {
        isPlaying = false
        currentAudio = null
        onEnd?.()
      }

      audio.onerror = (e) => {
        console.warn('[SarvamClient] Audio playback error, falling back to browser speech:', e)
        currentAudio = null
        speakWithBrowserSpeech(cleanText, lang, onEnd, onError, rate)
      }

      await audio.play()
      return
    } catch (playErr) {
      console.warn('[SarvamClient] Playback failed, falling back to browser speech:', playErr)
      currentAudio = null
    }
  }

  // 3. Graceful fallback to browser speech synthesis
  speakWithBrowserSpeech(cleanText, lang, onEnd, onError, rate)
}

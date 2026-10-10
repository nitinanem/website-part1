import { describe, it, expect, vi, beforeEach } from 'vitest'
import { speechNarrator } from '@/lib/tts/speech-narrator'

describe('SpeechNarratorEngine (Multilingual TTS)', () => {
  beforeEach(() => {
    // Reset state
    speechNarrator.stop()
  })

  it('splits long paragraph text into clean sentence chunks', () => {
    const rawText =
      'A healthy synovial joint consists of two articulating bone surfaces capped by smooth cartilage. In osteoarthritis, the equilibrium is disrupted. Over time, micro-cracks form in the cartilage matrix!'

    const chunks = speechNarrator.splitTextToChunks(rawText)
    expect(chunks.length).toBeGreaterThanOrEqual(3)
    expect(chunks[0]).toContain('A healthy synovial joint')
    expect(chunks[1]).toContain('In osteoarthritis')
    expect(chunks[2]).toContain('Over time')
  })

  it('handles Indic language punctuation (purna viram ।) in chunking', () => {
    const hindiText =
      'जोड़ों की संरचना बहुत महत्वपूर्ण है। ऑस्टियोआर्थराइटिस में कार्टिलेज घिसने लगता है। नियमित व्यायाम से लाभ होता है।'
    const chunks = speechNarrator.splitTextToChunks(hindiText)
    expect(chunks.length).toBe(3)
    expect(chunks[0]).toContain('जोड़ों की संरचना')
    expect(chunks[1]).toContain('ऑस्टियोआर्थराइटिस')
    expect(chunks[2]).toContain('नियमित व्यायाम')
  })

  it('updates playback state and rate cleanly', () => {
    speechNarrator.setRate(1.2)
    const state = speechNarrator.getState()
    expect(state.rate).toBe(1.2)
  })

  it('handles empty sections gracefully without errors', () => {
    speechNarrator.speak([], { lang: 'en' })
    const state = speechNarrator.getState()
    expect(state.status).toBe('idle')
    expect(state.totalSections).toBe(0)
  })
})

import type { Language } from '@/lib/i18n/context'
import { speakText, stopAudio, pauseAudio, resumeAudio } from './sarvam-client'

export interface NarratorSection {
  id: string
  title: string
  text: string
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused'

export interface NarratorState {
  status: PlaybackStatus
  currentSectionIndex: number
  totalSections: number
  currentSectionId: string | null
  currentSectionTitle: string | null
  rate: number
  language: Language
  supported: boolean
}

export interface NarratorListener {
  (state: NarratorState): void
}

const LOCALE_PREFERENCES: Record<Language, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  hi: ['hi-IN', 'hi'],
  pa: ['pa-IN', 'pa-PK', 'pa', 'hi-IN'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
  as: ['as-IN', 'as', 'bn-IN', 'hi-IN'],
}

class SpeechNarratorEngine {
  private queue: NarratorSection[] = []
  private currentIndex = 0
  private currentChunkIndex = 0
  private currentChunks: string[] = []
  private rate = 1.0
  private language: Language = 'en'
  private status: PlaybackStatus = 'idle'
  private listeners: Set<NarratorListener> = new Set()
  private availableVoices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined'
  }

  private loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.availableVoices = window.speechSynthesis.getVoices()
    }
  }

  public subscribe(listener: NarratorListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    const state = this.getState()
    this.listeners.forEach((listener) => {
      try {
        listener(state)
      } catch (err) {
        console.error('TTS listener error:', err)
      }
    })
  }

  public getState(): NarratorState {
    const current = this.queue[this.currentIndex]
    return {
      status: this.status,
      currentSectionIndex: this.currentIndex,
      totalSections: this.queue.length,
      currentSectionId: current ? current.id : null,
      currentSectionTitle: current ? current.title : null,
      rate: this.rate,
      language: this.language,
      supported: this.isSupported(),
    }
  }

  public getMatchingVoice(lang: Language): SpeechSynthesisVoice | null {
    if (!this.availableVoices.length) {
      this.loadVoices()
    }
    const prefixes = LOCALE_PREFERENCES[lang] || ['en']
    for (const prefix of prefixes) {
      const match = this.availableVoices.find((v) =>
        v.lang.toLowerCase().startsWith(prefix.toLowerCase().replace('_', '-'))
      )
      if (match) return match
    }
    return this.availableVoices[0] || null
  }

  /**
   * Cleans and splits text into bite-sized sentence chunks
   * for natural pacing and pause/resume control.
   */
  public splitTextToChunks(rawText: string): string[] {
    const cleaned = rawText
      .replace(/[•\-\*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!cleaned) return []

    // Split on periods, exclamation, questions, Devanagari/Bengali/Assamese purna viram (।)
    const sentenceRegex = /[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g
    const matches = cleaned.match(sentenceRegex) || [cleaned]

    const chunks: string[] = []
    for (const s of matches) {
      const trimmed = s.trim()
      if (trimmed.length > 250) {
        // Break on commas or sub-clauses if single sentence is extra long
        const parts = trimmed.split(/[,;:—–]/).map((p) => p.trim()).filter(Boolean)
        chunks.push(...parts)
      } else if (trimmed.length > 0) {
        chunks.push(trimmed)
      }
    }
    return chunks.length > 0 ? chunks : [cleaned]
  }

  public speak(
    sections: NarratorSection[],
    options: {
      lang: Language
      startIndex?: number
      rate?: number
    }
  ): void {
    if (!this.isSupported()) return

    this.stop()

    this.queue = sections.filter((s) => s.text.trim().length > 0)
    if (this.queue.length === 0) return

    this.language = options.lang
    this.rate = options.rate ?? this.rate
    this.currentIndex = Math.max(
      0,
      Math.min(options.startIndex ?? 0, this.queue.length - 1)
    )
    this.status = 'playing'
    this.notify()

    this.prepareAndSpeakSection(this.currentIndex)
  }

  public speakSingle(section: NarratorSection, options: { lang: Language; rate?: number }): void {
    this.speak([section], options)
  }

  private prepareAndSpeakSection(index: number): void {
    if (index >= this.queue.length) {
      this.status = 'idle'
      this.notify()
      return
    }

    this.currentIndex = index
    const section = this.queue[index]
    this.currentChunks = this.splitTextToChunks(section.text)
    this.currentChunkIndex = 0

    if (this.currentChunks.length === 0) {
      this.nextSection()
      return
    }

    this.speakCurrentChunk()
  }

  private speakCurrentChunk(): void {
    if (this.status !== 'playing') return

    if (this.currentChunkIndex >= this.currentChunks.length) {
      this.nextSection()
      return
    }

    const chunkText = this.currentChunks[this.currentChunkIndex]

    // Use Sarvam AI primary audio synthesis with browser TTS fallback
    speakText(
      chunkText,
      this.language,
      () => {
        if (this.status === 'playing') {
          this.currentChunkIndex++
          this.speakCurrentChunk()
        }
      },
      () => {
        if (this.status === 'playing') {
          this.currentChunkIndex++
          this.speakCurrentChunk()
        }
      },
      this.rate
    )
    this.notify()
  }

  public pause(): void {
    if (!this.isSupported() || this.status !== 'playing') return
    pauseAudio()
    this.status = 'paused'
    this.notify()
  }

  public resume(): void {
    if (!this.isSupported() || this.status !== 'paused') return
    resumeAudio()
    this.status = 'playing'
    this.notify()
  }

  public stop(): void {
    if (!this.isSupported()) return
    stopAudio()
    this.status = 'idle'
    this.currentChunks = []
    this.currentChunkIndex = 0
    this.notify()
  }

  public nextSection(): void {
    if (this.currentIndex < this.queue.length - 1) {
      this.prepareAndSpeakSection(this.currentIndex + 1)
    } else {
      this.status = 'idle'
      this.notify()
    }
  }

  public prevSection(): void {
    if (this.currentIndex > 0) {
      this.prepareAndSpeakSection(this.currentIndex - 1)
    } else {
      this.prepareAndSpeakSection(0)
    }
  }

  public jumpToSection(index: number): void {
    if (index >= 0 && index < this.queue.length) {
      this.prepareAndSpeakSection(index)
    }
  }

  public setRate(rate: number): void {
    this.rate = rate
    if (this.status === 'playing') {
      // Re-trigger current chunk with new rate
      window.speechSynthesis.cancel()
      this.speakCurrentChunk()
    } else {
      this.notify()
    }
  }
}

// Global singleton instance
export const speechNarrator = new SpeechNarratorEngine()

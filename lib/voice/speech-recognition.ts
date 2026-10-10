'use client'

import type { Language } from '@/lib/i18n/context'

export type VoiceState = 'idle' | 'listening' | 'speaking' | 'processing' | 'error'

export interface VoiceRecognitionOptions {
  language: Language
  onInterim?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (err: string) => void
  onStateChange?: (state: VoiceState) => void
}

const LANG_TO_BCP47: Record<Language, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  pa: 'pa-IN',
  // Web Speech API in Chrome/Safari lacks native 'as-IN' acoustic models.
  // Using 'bn-IN' (Eastern Nagari script & shared phonetics) allows accurate transcription of Assamese.
  as: 'bn-IN',
}

class SpeechRecognitionClient {
  private recognition: any = null
  private isListening = false
  private language: Language = 'hi'
  private onInterim?: (text: string) => void
  private onFinal?: (text: string) => void
  private onError?: (err: string) => void
  private onStateChange?: (state: VoiceState) => void
  private state: VoiceState = 'idle'

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.maxAlternatives = 1

        this.recognition.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (interimTranscript && this.onInterim) {
            this.onInterim(interimTranscript.trim())
          }

          if (finalTranscript && this.onFinal) {
            this.setState('processing')
            this.onFinal(finalTranscript.trim())
          }
        }

        this.recognition.onerror = (event: any) => {
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return
          }
          console.warn('[SpeechRecognition] Error:', event.error)

          if (event.error === 'language-not-supported') {
            try {
              this.recognition.lang = 'bn-IN'
              if (this.isListening && this.state !== 'speaking') {
                this.recognition.start()
              }
            } catch {}
            return
          }

          if (event.error === 'not-allowed') {
            this.onError?.('Microphone access was denied. Please allow microphone permissions in your browser.')
          }
          if (this.state !== 'speaking') {
            this.setState('idle')
          }
        }

        this.recognition.onend = () => {
          // If we are supposed to be listening and not speaking, keep continuous listening active
          if (this.isListening && this.state !== 'speaking') {
            try {
              this.recognition.start()
            } catch {
              // Retry shortly after Chrome audio thread releases
              setTimeout(() => {
                if (this.isListening && this.state !== 'speaking') {
                  try {
                    this.recognition.start()
                  } catch {}
                }
              }, 200)
            }
          } else if (this.state !== 'speaking') {
            this.setState('idle')
          }
        }
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  }

  private setState(s: VoiceState) {
    this.state = s
    this.onStateChange?.(s)
  }

  public configure(options: VoiceRecognitionOptions) {
    this.language = options.language
    this.onInterim = options.onInterim
    this.onFinal = options.onFinal
    this.onError = options.onError
    this.onStateChange = options.onStateChange

    if (this.recognition) {
      this.recognition.lang = LANG_TO_BCP47[options.language] || 'hi-IN'
    }
  }

  public startListening() {
    if (!this.recognition) {
      this.onError?.('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.')
      return
    }

    this.isListening = true
    try {
      this.recognition.lang = LANG_TO_BCP47[this.language] || 'hi-IN'
      this.recognition.start()
      this.setState('listening')
    } catch {
      // If already started or transitioning, ensure listening state and retry
      this.setState('listening')
      setTimeout(() => {
        if (this.isListening && this.state !== 'speaking') {
          try {
            this.recognition.start()
          } catch {}
        }
      }, 200)
    }
  }

  public stopListening() {
    this.isListening = false
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch {}
    }
    if (this.state !== 'speaking') {
      this.setState('idle')
    }
  }

  /**
   * Speak a prompt to the senior using Text-to-Speech (Sarvam AI with browser fallback),
   * automatically pausing speech recognition so it doesn't hear itself.
   */
  public async speakText(text: string, lang: Language = this.language): Promise<void> {
    if (typeof window === 'undefined') return

    return new Promise(async (resolve) => {
      // Stop listening while speaking to completely avoid self-hearing or audio collision
      if (this.recognition) {
        try {
          this.recognition.stop()
        } catch {}
      }

      this.setState('speaking')

      let isDone = false
      const handleFinish = () => {
        if (isDone) return
        isDone = true
        this.setState('idle')
        resolve()
      }

      // Safety timeout: ensure TTS never locks up execution longer than 8 seconds
      const timeout = setTimeout(handleFinish, 8000)

      try {
        const { speakText: speakWithSarvam } = await import('@/lib/tts/sarvam-client')
        await speakWithSarvam(
          text,
          lang,
          () => {
            clearTimeout(timeout)
            handleFinish()
          },
          () => {
            clearTimeout(timeout)
            handleFinish()
          },
          0.92
        )
      } catch (err) {
        clearTimeout(timeout)
        handleFinish()
      }
    })
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined') {
      import('@/lib/tts/sarvam-client').then(({ stopAudio }) => stopAudio())
      this.setState('idle')
    }
  }
}

export const speechRecognitionClient = new SpeechRecognitionClient()

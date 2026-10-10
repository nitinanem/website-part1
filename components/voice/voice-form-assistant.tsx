'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  HeartHandshake,
  Loader2,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { speechRecognitionClient, type VoiceState } from '@/lib/voice/speech-recognition'
import {
  parseAge,
  parseGender,
  parseName,
  parsePhone,
  parseYesNo,
  parseCommand,
} from '@/lib/voice/voice-form-parser'

export interface VoiceFormData {
  name: string
  age: string
  gender: string
  phone: string
  answers: Record<string, boolean>
}

interface Props {
  isOpen: boolean
  onClose: () => void
  formData: VoiceFormData
  onUpdateField: (field: string, value: any) => void
  onSubmit: () => void
  questions: { id: string; text: string }[]
}

type StepKey = 'intro' | 'name' | 'age' | 'gender' | 'phone' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'review'

const STEPS: StepKey[] = ['intro', 'name', 'age', 'gender', 'phone', 'q1', 'q2', 'q3', 'q4', 'q5', 'review']

export function VoiceFormAssistant({
  isOpen,
  onClose,
  formData,
  onUpdateField,
  onSubmit,
  questions,
}: Props) {
  const { t, language } = useTranslation()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [lastSpokenConfirmation, setLastSpokenConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [activeProvider, setActiveProvider] = useState<'gemini' | 'groq' | 'local_voice_agent' | null>(null)

  // Use refs to avoid stale closures in recognition callbacks
  const currentStepIndexRef = useRef<number>(0)
  const currentStepRef = useRef<StepKey>('intro')
  const isProcessingRef = useRef<boolean>(false)
  const isSpeakingRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(false)
  isMutedRef.current = isMuted

  const currentStep = STEPS[currentStepIndex] || 'intro'
  currentStepRef.current = currentStep
  currentStepIndexRef.current = currentStepIndex

  // Get question text for current step
  const getStepPrompt = useCallback(
    (step?: StepKey): string => {
      if (!step) return ''
      if (step === 'intro') {
        return t.voiceAssistant.greetingPrompt
      }
      if (step === 'name') {
        return t.voiceAssistant.namePrompt
      }
      if (step === 'age') {
        return t.voiceAssistant.agePrompt
      }
      if (step === 'gender') {
        return t.voiceAssistant.genderPrompt
      }
      if (step === 'phone') {
        return t.voiceAssistant.phonePrompt
      }
      if (step === 'review') {
        return t.voiceAssistant.reviewPrompt
      }

      // q1 to q5
      if (step.startsWith('q')) {
        const qIndex = parseInt(step.replace('q', ''), 10) - 1
        const q = questions?.[qIndex]
        if (q) {
          if (language === 'hi') {
            return `सवाल ${qIndex + 1}: ${q.text}। क्या ऐसा होता है? 'हाँ' या 'नहीं' बोलें।`
          } else if (language === 'as') {
            return `প্ৰশ্ন ${qIndex + 1}: ${q.text}। এনেকুৱা হয়নে? 'হয়' বা 'নহয়' কওক।`
          } else if (language === 'bn') {
            return `প্রশ্ন ${qIndex + 1}: ${q.text}। এমন কি হয়? 'হ্যাঁ' অথবা 'না' বলুন।`
          } else if (language === 'pa') {
            return `ਸਵਾਲ ${qIndex + 1}: ${q.text}। ਕੀ ਅਜਿਹਾ ਹੁੰਦਾ ਹੈ? 'ਹਾਂ' ਜਾਂ 'ਨਹੀਂ' ਬੋਲੋ।`
          }
          return `Question ${qIndex + 1}: ${q.text}. Does this happen to you? Please say 'Yes' or 'No'.`
        }
      }
      return ''
    },
    [t, language, questions]
  )

  // Sequentially transition to a target step: speak prompt, then open listening
  const transitionToStep = useCallback(
    async (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= STEPS.length) return

      // Stop recognition while prompt is reading
      speechRecognitionClient.stopListening()

      currentStepIndexRef.current = targetIndex
      setCurrentStepIndex(targetIndex)
      const stepKey = STEPS[targetIndex]
      currentStepRef.current = stepKey

      setLiveTranscript('')
      setErrorMessage(null)

      const prompt = getStepPrompt(stepKey)
      if (prompt && !isMutedRef.current) {
        isSpeakingRef.current = true
        setVoiceState('speaking')
        await speechRecognitionClient.speakText(prompt, language)
        isSpeakingRef.current = false
      }

      // Turn on listening for patient's reply
      setVoiceState('listening')
      speechRecognitionClient.startListening()
    },
    [getStepPrompt, language]
  )

  // Client-side fallback deterministic parser
  const runOfflineParser = useCallback(
    (step: StepKey, rawText: string) => {
      let recognizedValue: any = null
      let confirmationText = ''

      if (step === 'name') {
        const parsed = parseName(rawText)
        if (parsed) {
          recognizedValue = parsed
          if (language === 'hi') confirmationText = `नमस्ते ${parsed} जी।`
          else if (language === 'as') confirmationText = `নমস্কাৰ ${parsed} ডাঙৰীয়া।`
          else if (language === 'bn') confirmationText = `নমস্কার ${parsed} বাবু।`
          else if (language === 'pa') confirmationText = `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${parsed} ਜੀ।`
          else confirmationText = `Hello ${parsed}.`
        }
      } else if (step === 'age') {
        const parsed = parseAge(rawText)
        if (parsed !== null) {
          recognizedValue = String(parsed)
          if (language === 'hi') confirmationText = `आपकी उम्र ${parsed} साल दर्ज कर ली गई है।`
          else if (language === 'as') confirmationText = `আপোনাৰ বয়স ${parsed} বছৰ লিপিবদ্ধ কৰা হ'ল।`
          else if (language === 'bn') confirmationText = `আপনার বয়স ${parsed} বছর রেকর্ড করা হয়েছে।`
          else if (language === 'pa') confirmationText = `ਤੁਹਾਡੀ ਉਮਰ ${parsed} ਸਾਲ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ।`
          else confirmationText = `Recorded age ${parsed}.`
        }
      } else if (step === 'gender') {
        const parsed = parseGender(rawText)
        if (parsed !== null) {
          recognizedValue = parsed
          if (language === 'hi') {
            const gLabel = parsed === 'female' ? 'महिला' : parsed === 'male' ? 'पुरुष' : 'अन्य'
            confirmationText = `${gLabel} दर्ज किया गया।`
          } else if (language === 'as') {
            const gLabel = parsed === 'female' ? 'মহিলা' : parsed === 'male' ? 'পুৰুষ' : 'অন্য'
            confirmationText = `${gLabel} বাছনি কৰা হ'ল।`
          } else if (language === 'bn') {
            const gLabel = parsed === 'female' ? 'মহিলা' : parsed === 'male' ? 'পুরুষ' : 'অন্য'
            confirmationText = `${gLabel} নির্বাচন করা হয়েছে।`
          } else if (language === 'pa') {
            const gLabel = parsed === 'female' ? 'ਮਹਿਲਾ' : parsed === 'male' ? 'ਪੁਰਸ਼' : 'ਹੋਰ'
            confirmationText = `${gLabel} ਚੁਣਿਆ ਗਿਆ ਹੈ।`
          } else {
            confirmationText = `Selected ${parsed}.`
          }
        }
      } else if (step === 'phone') {
        if (
          rawText.toLowerCase().includes('छोड़') ||
          rawText.toLowerCase().includes('skip') ||
          rawText.toLowerCase().includes('পরবর্তী') ||
          rawText.toLowerCase().includes('আগলৈ')
        ) {
          recognizedValue = ''
          confirmationText = 'Moving forward.'
        } else {
          const parsed = parsePhone(rawText)
          if (parsed) {
            recognizedValue = parsed
            if (language === 'hi') confirmationText = 'फ़ोन नंबर दर्ज किया गया।'
            else if (language === 'as') confirmationText = 'ফোন নম্বৰ লিপিবদ্ধ কৰা হ’ল।'
            else if (language === 'bn') confirmationText = 'ফোন নম্বর রেকর্ড করা হয়েছে।'
            else if (language === 'pa') confirmationText = 'ਫ਼ੋਨ ਨੰਬਰ ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।'
            else confirmationText = 'Phone number saved.'
          }
        }
      } else if (step.startsWith('q')) {
        const parsed = parseYesNo(rawText)
        if (parsed !== null) {
          recognizedValue = parsed
          if (language === 'hi') confirmationText = parsed ? 'हाँ, दर्ज कर लिया गया है।' : 'नहीं, दर्ज कर लिया गया है।'
          else if (language === 'as') confirmationText = parsed ? 'হয়, লিপিবদ্ধ কৰা হ’ল।' : 'নহয়, লিপিবদ্ধ কৰা হ’ল।'
          else if (language === 'bn') confirmationText = parsed ? 'হ্যাঁ, রেকর্ড করা হয়েছে।' : 'না, রেকর্ড করা হয়েছে।'
          else if (language === 'pa') confirmationText = parsed ? 'ਹਾਂ, ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।' : 'ਨਹੀਂ, ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।'
          else confirmationText = parsed ? 'Recorded yes.' : 'Recorded no.'
        }
      } else if (step === 'review') {
        const affirm = parseYesNo(rawText)
        if (affirm === true) {
          recognizedValue = 'submit'
          confirmationText = 'Submitting form.'
        }
      }

      return { recognizedValue, confirmationText }
    },
    [language]
  )

  // Handle recognized transcript through Multilayer Voice System
  const handleVoiceInput = useCallback(
    async (rawText: string) => {
      if (!rawText.trim() || isProcessingRef.current || isSpeakingRef.current) return
      isProcessingRef.current = true

      // Immediately silence the mic while analyzing
      speechRecognitionClient.stopListening()
      setVoiceState('processing')
      setLiveTranscript(rawText)

      const step = currentStepRef.current
      const stepIndex = currentStepIndexRef.current

      // Fast navigation commands
      const command = parseCommand(rawText)
      if (command === 'repeat') {
        isProcessingRef.current = false
        await transitionToStep(stepIndex)
        return
      }
      if (command === 'stop') {
        isProcessingRef.current = false
        speechRecognitionClient.stopListening()
        speechRecognitionClient.stopSpeaking()
        onClose()
        return
      }
      if (command === 'next') {
        isProcessingRef.current = false
        if (stepIndex < STEPS.length - 1) {
          await transitionToStep(stepIndex + 1)
        }
        return
      }
      if (command === 'prev') {
        isProcessingRef.current = false
        if (stepIndex > 0) {
          await transitionToStep(stepIndex - 1)
        }
        return
      }

      if (step === 'intro') {
        isProcessingRef.current = false
        await transitionToStep(1)
        return
      }

      if (
        step === 'review' &&
        (command === 'submit' ||
          rawText.toLowerCase().includes('submit') ||
          rawText.toLowerCase().includes('जमा') ||
          parseYesNo(rawText) === true)
      ) {
        if (!isMutedRef.current) {
          isSpeakingRef.current = true
          setVoiceState('speaking')
          await speechRecognitionClient.speakText(t.voiceAssistant.submitPrompt, language)
          isSpeakingRef.current = false
        }
        onSubmit()
        onClose()
        isProcessingRef.current = false
        return
      }

      // Multilayer Voice Endpoint: Gemini -> Groq -> Local Voice Agent
      let handled = false
      let recognizedField = step
      let recognizedVal: any = null
      let spokenConfirmation = ''

      try {
        const res = await fetch('/api/voice/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: rawText,
            currentStep: step,
            language,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data && data.provider) {
            setActiveProvider(data.provider)
          }

          if (data && data.command === 'submit' && step === 'review') {
            if (!isMutedRef.current) {
              isSpeakingRef.current = true
              setVoiceState('speaking')
              await speechRecognitionClient.speakText(t.voiceAssistant.submitPrompt, language)
              isSpeakingRef.current = false
            }
            onSubmit()
            onClose()
            isProcessingRef.current = false
            return
          }

          if (data && data.value !== undefined && data.type !== 'unknown') {
            handled = true
            recognizedField = data.field || step
            recognizedVal = recognizedField.startsWith('q') ? Boolean(data.value) : data.value
            spokenConfirmation = data.spokenConfirmation || ''
          }
        }
      } catch (networkErr) {
        console.warn('[Multilayer Voice] Network call failed, running Client Offline Voice Agent:', networkErr)
      }

      // If server returned unknown or network is offline, engage client offline parser
      if (!handled) {
        setActiveProvider('local_voice_agent')
        const offlineResult = runOfflineParser(step, rawText)
        if (offlineResult.recognizedValue !== null) {
          handled = true
          recognizedVal = offlineResult.recognizedValue
          spokenConfirmation = offlineResult.confirmationText
        }
      }

      if (handled && recognizedVal !== null) {
        // Update state in parent
        onUpdateField(recognizedField, recognizedVal)

        if (spokenConfirmation) {
          setLastSpokenConfirmation(spokenConfirmation)
          if (!isMutedRef.current) {
            isSpeakingRef.current = true
            setVoiceState('speaking')
            await speechRecognitionClient.speakText(spokenConfirmation, language)
            isSpeakingRef.current = false
          }
        }

        isProcessingRef.current = false

        // Seamlessly advance to the next step
        if (stepIndex < STEPS.length - 1) {
          await transitionToStep(stepIndex + 1)
        } else {
          setVoiceState('idle')
        }
      } else {
        // Not recognized, politely ask senior to repeat
        let retryPrompt = "Sorry, I didn't quite catch that. Please speak again."
        if (step.startsWith('q')) {
          if (language === 'hi') retryPrompt = 'कृपया "हाँ" या "नहीं" बोलें।'
          else if (language === 'as') retryPrompt = 'অনুগ্ৰহ কৰি "হয়" বা "নহয়" কওক।'
          else if (language === 'bn') retryPrompt = 'অনুগ্রহ করে "হ্যাঁ" অথবা "না" বলুন।'
          else if (language === 'pa') retryPrompt = 'ਕਿਰਪਾ ਕਰਕੇ "ਹਾਂ" ਜਾਂ "ਨਹੀਂ" ਬੋਲੋ।'
          else retryPrompt = 'Please say "Yes" or "No".'
        } else {
          if (language === 'hi') retryPrompt = 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया दोबारा बोलें।'
          else if (language === 'as') retryPrompt = 'মাফ কৰিব, মই বুজি নাপালোঁ। অনুগ্ৰহ কৰি পুনৰ কওক।'
          else if (language === 'bn') retryPrompt = 'দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আবার বলুন।'
          else if (language === 'pa') retryPrompt = 'ਮਾਫ਼ ਕਰਨਾ, ਮੈਂ ਸਮਝ ਨਹੀਂ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।'
        }

        if (!isMutedRef.current) {
          isSpeakingRef.current = true
          setVoiceState('speaking')
          await speechRecognitionClient.speakText(retryPrompt, language)
          isSpeakingRef.current = false
        }

        isProcessingRef.current = false
        // Re-enable listening
        setVoiceState('listening')
        speechRecognitionClient.startListening()
      }
    },
    [language, runOfflineParser, onUpdateField, onSubmit, onClose, t, transitionToStep]
  )

  // Configure speech recognition ONCE when modal opens or language changes
  useEffect(() => {
    if (!isOpen) {
      speechRecognitionClient.stopListening()
      speechRecognitionClient.stopSpeaking()
      isProcessingRef.current = false
      isSpeakingRef.current = false
      return
    }

    speechRecognitionClient.configure({
      language,
      onInterim: (text) => {
        if (!isSpeakingRef.current && !isProcessingRef.current) {
          setLiveTranscript(text)
        }
      },
      onFinal: (text) => {
        if (!isSpeakingRef.current && !isProcessingRef.current) {
          handleVoiceInput(text)
        }
      },
      onError: (err) => {
        if (!isSpeakingRef.current) {
          setErrorMessage(err)
        }
      },
      onStateChange: (st) => {
        // Do not let recognition override 'speaking' or 'processing' states
        if (!isSpeakingRef.current && !isProcessingRef.current) {
          setVoiceState(st)
        }
      },
    })

    // Start questionnaire on step 0
    transitionToStep(0)

    return () => {
      speechRecognitionClient.stopListening()
      speechRecognitionClient.stopSpeaking()
      isProcessingRef.current = false
      isSpeakingRef.current = false
    }
  }, [isOpen, language, handleVoiceInput, transitionToStep])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Voice Assistant"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl sm:p-8"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <HeartHandshake className="size-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {t.voiceAssistant.startVoiceBtn}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <Sparkles className="size-3" />
                    Senior Care
                  </span>
                </div>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t.voiceAssistant.seniorHelpHint}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isMuted) {
                    setIsMuted(false)
                    isMutedRef.current = false
                    transitionToStep(currentStepIndexRef.current)
                  } else {
                    speechRecognitionClient.stopSpeaking()
                    setIsMuted(true)
                    isMutedRef.current = true
                  }
                }}
                className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                title={isMuted ? 'Unmute voice' : 'Mute voice'}
                aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  speechRecognitionClient.stopListening()
                  speechRecognitionClient.stopSpeaking()
                  onClose()
                }}
                className="rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                aria-label="Close assistant"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Assistant Status & Pulsing Wave */}
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <div className="relative mb-4 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                animate={
                  voiceState === 'listening'
                    ? { scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }
                    : { scale: 1, opacity: 0 }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute size-28 rounded-full bg-emerald-500/20"
              />
              <motion.div
                animate={
                  voiceState === 'speaking'
                    ? { scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }
                    : { scale: 1, opacity: 0 }
                }
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute size-28 rounded-full bg-primary/20"
              />

              <button
                type="button"
                onClick={() => {
                  if (voiceState === 'listening') {
                    speechRecognitionClient.stopListening()
                    setVoiceState('idle')
                  } else if (voiceState === 'speaking') {
                    speechRecognitionClient.stopSpeaking()
                    setVoiceState('listening')
                    speechRecognitionClient.startListening()
                  } else {
                    transitionToStep(currentStepIndexRef.current)
                  }
                }}
                className={`relative flex size-20 items-center justify-center rounded-full text-white shadow-xl transition-all cursor-pointer ${
                  voiceState === 'listening'
                    ? 'bg-emerald-600 shadow-emerald-500/30 ring-4 ring-emerald-400/40 animate-pulse'
                    : voiceState === 'speaking'
                    ? 'bg-primary shadow-primary/30 ring-4 ring-primary/40'
                    : 'bg-muted text-muted-foreground hover:bg-primary hover:text-white'
                }`}
                aria-label={voiceState === 'listening' ? 'Stop listening' : 'Start listening'}
              >
                {voiceState === 'speaking' ? (
                  <Volume2 className="size-8" />
                ) : voiceState === 'listening' ? (
                  <Mic className="size-8" />
                ) : voiceState === 'processing' ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : (
                  <MicOff className="size-8" />
                )}
              </button>
            </div>

            {/* Status pill badge & Multilayer Provider Indicator */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide ${
                  voiceState === 'listening'
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : voiceState === 'speaking'
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <span
                  className={`size-2.5 rounded-full ${
                    voiceState === 'listening'
                      ? 'bg-emerald-500 animate-ping'
                      : voiceState === 'speaking'
                      ? 'bg-primary animate-pulse'
                      : 'bg-muted-foreground'
                  }`}
                />
                {voiceState === 'listening'
                  ? t.voiceAssistant.listeningBadge
                  : voiceState === 'speaking'
                  ? t.voiceAssistant.speakingBadge
                  : voiceState === 'processing'
                  ? 'Processing response...'
                  : 'Tap mic to speak'}
              </span>

              {activeProvider && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border ${
                    activeProvider === 'gemini'
                      ? 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400'
                      : activeProvider === 'groq'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400'
                  }`}
                  title={
                    activeProvider === 'gemini'
                      ? 'Layer 1: Google Gemini API'
                      : activeProvider === 'groq'
                      ? 'Layer 2: Groq Cloud API'
                      : 'Layer 3: Local Offline Voice Agent'
                  }
                >
                  <Sparkles className="size-3" />
                  {activeProvider === 'gemini'
                    ? 'Layer 1: Gemini AI'
                    : activeProvider === 'groq'
                    ? 'Layer 2: Groq Engine'
                    : 'Layer 3: Local Voice Agent'}
                </span>
              )}
            </div>

            {/* Main Question Text for Elderly (Extra Large, High Contrast) */}
            <div className="mt-5 max-w-xl rounded-2xl border border-border bg-secondary/30 p-5 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
              <p className="mt-2 text-xl font-bold leading-snug text-foreground sm:text-2xl">
                {getStepPrompt(currentStep)}
              </p>
            </div>

            {/* Live Transcript / Feedback Box */}
            <div className="mt-4 min-h-[48px] w-full max-w-xl rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-semibold text-primary">{t.voiceAssistant.youSaid} </span>
              <span className="font-medium text-foreground italic">
                {liveTranscript || t.voiceAssistant.listeningPlaceholder}
              </span>
              {lastSpokenConfirmation && (
                <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <Check className="size-3.5" />
                  {lastSpokenConfirmation}
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="mt-2 text-xs font-semibold text-destructive">{errorMessage}</p>
            )}
          </div>

          {/* Senior Quick-Tap Alternatives (for reassurance & tactile accessibility) */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-4">
            {currentStep === 'intro' && (
              <button
                type="button"
                onClick={() => transitionToStep(1)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90 cursor-pointer"
              >
                <span>Start Questions</span>
                <ArrowRight className="size-4" />
              </button>
            )}

            {currentStep.startsWith('q') && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleVoiceInput(
                      language === 'hi' ? 'हाँ' : language === 'as' ? 'হয়' : language === 'bn' ? 'হ্যাঁ' : language === 'pa' ? 'ਹਾਂ' : 'yes'
                    )
                  }
                  className="flex flex-1 min-w-[140px] items-center justify-center gap-2.5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 py-3.5 text-lg font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-600 hover:text-white cursor-pointer active:scale-95 shadow-sm"
                >
                  <Check className="size-6" />
                  <span>{t.common.yes}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleVoiceInput(
                      language === 'hi' ? 'नहीं' : language === 'as' ? 'নহয়' : language === 'bn' ? 'না' : language === 'pa' ? 'ਨਹੀਂ' : 'no'
                    )
                  }
                  className="flex flex-1 min-w-[140px] items-center justify-center gap-2.5 rounded-2xl border-2 border-red-500/40 bg-red-500/10 py-3.5 text-lg font-bold text-red-700 dark:text-red-300 transition-all hover:bg-red-600 hover:text-white cursor-pointer active:scale-95 shadow-sm"
                >
                  <X className="size-6" />
                  <span>{t.common.no}</span>
                </button>
              </>
            )}

            {currentStep === 'gender' && (
              <>
                {(['male', 'female', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleVoiceInput(g)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold capitalize hover:border-primary hover:bg-primary/5 cursor-pointer"
                  >
                    {g === 'male' ? t.auth.genderMale : g === 'female' ? t.auth.genderFemale : t.auth.genderOther}
                  </button>
                ))}
              </>
            )}

            {currentStep === 'phone' && (
              <button
                type="button"
                onClick={() => handleVoiceInput('skip')}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                {t.voiceAssistant.nextBtn} ({t.common.optional})
              </button>
            )}

            {currentStep === 'review' && (
              <button
                type="button"
                onClick={() => handleVoiceInput('submit')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg hover:bg-primary/90 cursor-pointer"
              >
                <Check className="size-5" />
                {t.doctorCheck.seeRecommendation}
              </button>
            )}
          </div>

          {/* Stepper Navigation Bar */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={() => transitionToStep(Math.max(0, currentStepIndex - 1))}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              {t.voiceAssistant.prevBtn}
            </button>

            <button
              type="button"
              onClick={() => transitionToStep(currentStepIndex)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            >
              <RotateCcw className="size-4" />
              {t.voiceAssistant.repeatBtn}
            </button>

            <button
              type="button"
              disabled={currentStepIndex >= STEPS.length - 1}
              onClick={() => transitionToStep(Math.min(STEPS.length - 1, currentStepIndex + 1))}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
            >
              {t.voiceAssistant.nextBtn}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

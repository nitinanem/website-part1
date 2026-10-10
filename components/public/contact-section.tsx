'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneCall,
  Mail,
  MessageSquare,
  Bot,
  Sparkles,
  ShieldCheck,
  Mic,
  MicOff,
  CheckCircle2,
  Send,
  User,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { speechRecognitionClient } from '@/lib/voice/speech-recognition'

export function ContactSection() {
  const { t, language } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('clinical')
  const [isDictating, setIsDictating] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const topics = [
    { id: 'clinical', label: t.contact.topicClinical || 'Joint Pain & Symptoms' },
    { id: 'diet', label: t.contact.topicDiet || 'Diet & Exercise' },
    { id: 'general', label: t.contact.topicGeneral || 'General Inquiry' },
    { id: 'feedback', label: t.contact.topicFeedback || 'Platform Suggestion' },
  ]

  const toggleDictation = () => {
    if (isDictating) {
      speechRecognitionClient.stopListening()
      setIsDictating(false)
    } else {
      setIsDictating(true)
      speechRecognitionClient.configure({
        language,
        onInterim: (text) => {
          // Show live speech
        },
        onFinal: (text) => {
          setMessage((prev) => (prev ? `${prev} ${text}` : text))
        },
        onError: () => {
          setIsDictating(false)
        },
        onStateChange: (state) => {
          if (state !== 'listening') {
            setIsDictating(false)
          }
        },
      })
      speechRecognitionClient.startListening()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    // Simulate swift network delivery
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      speechRecognitionClient.stopListening()
      setIsDictating(false)
    }, 600)
  }

  const handleReset = () => {
    setName('')
    setEmail('')
    setMessage('')
    setSubmitted(false)
  }

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      {/* Decorative ambient background glow */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Context, Helplines & Patient Support Channels */}
        <div className="flex flex-col justify-between lg:col-span-5 lg:pr-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20">
              <Sparkles className="size-3.5" />
              {t.contact.supportBadge || 'Patient & Community Support'}
            </span>

            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.contact.publicTitle}
            </h2>

            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t.contact.publicSubtitle}
            </p>

            {/* Quick Contact & Reassurance Cards */}
            <div className="mt-8 space-y-4">
              {/* Toll-Free Senior Helpline */}
              <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card/60 p-4 shadow-xs backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <PhoneCall className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t.contact.helplineTitle || 'Toll-Free Senior Care Helpline'}
                  </h3>
                  <a
                    href="tel:1800564687"
                    className="text-base font-semibold tracking-wide text-primary hover:underline"
                  >
                    1800-JOINTS (1800-564-687)
                  </a>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {t.contact.helplineHours || 'Mon - Sat: 8:00 AM - 8:00 PM IST'}
                  </p>
                </div>
              </div>

              {/* 24/7 AI Joint Assistant */}
              <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card/60 p-4 shadow-xs backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Bot className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t.contact.aiAssistantBadge || '24/7 AI Joint Assistant'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t.contact.aiAssistantDesc || 'Instant guidance for joint pain, exercises & nutrition.'}
                  </p>
                </div>
              </div>

              {/* Direct Medical Inquiries */}
              <div className="group flex items-start gap-4 rounded-2xl border border-border bg-card/60 p-4 shadow-xs backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <Mail className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t.contact.emailSupportTitle || 'Direct Clinical Support'}
                  </h3>
                  <a
                    href="mailto:support@swastik.org.in"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    support@swastik.org.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Medical Confidentiality Notice */}
          <div className="mt-8 flex items-center gap-2 rounded-xl bg-secondary/50 px-3.5 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            <span>
              {t.contact.confidentialNote ||
                'Your messages and health inquiries remain strictly confidential under healthcare data standards.'}
            </span>
          </div>
        </div>

        {/* Right Column: Premium Interactive Query Card */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Topic Selector Chips */}
                  <div className="mb-6">
                    <span className="mb-2.5 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Select Query Topic:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((tItem) => {
                        const isSelected = selectedTopic === tItem.id
                        return (
                          <button
                            key={tItem.id}
                            type="button"
                            onClick={() => setSelectedTopic(tItem.id)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 ring-2 ring-primary/30'
                                : 'border border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:bg-secondary'
                            }`}
                          >
                            {tItem.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Name Field */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">
                          {t.contact.namePlaceholder}
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 size-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.contact.namePlaceholder}
                            required
                            className="w-full rounded-xl border border-border bg-background/60 py-3 pr-3.5 pl-10 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">
                          {t.contact.emailPlaceholder}
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 size-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.contact.emailPlaceholder}
                            required
                            className="w-full rounded-xl border border-border bg-background/60 py-3 pr-3.5 pl-10 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Message Field with Dictate / Speak Button */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-semibold text-foreground">
                          {t.contact.messagePlaceholder}
                        </label>

                        {/* Microphone Speech-To-Text Button */}
                        <button
                          type="button"
                          onClick={toggleDictation}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                            isDictating
                              ? 'bg-destructive/15 text-destructive border border-destructive/30 animate-pulse'
                              : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                          }`}
                          title="Click to speak your message"
                        >
                          {isDictating ? (
                            <>
                              <MicOff className="size-3.5" />
                              <span>{t.contact.dictating || 'Listening...'}</span>
                            </>
                          ) : (
                            <>
                              <Mic className="size-3.5" />
                              <span>{t.contact.dictateQuery || 'Dictate / Speak'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={
                            isDictating
                              ? t.contact.dictating || 'Listening to your voice...'
                              : t.contact.messagePlaceholder
                          }
                          rows={4}
                          required
                          className={`w-full resize-none rounded-xl border bg-background/60 p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/30 ${
                            isDictating ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="size-4 transition-transform group-hover:translate-x-1" />
                      <span>{isSubmitting ? t.common.submitting : t.contact.sendBtn}</span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* In-Place Interactive Success State (no ugly browser alert!) */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    <CheckCircle2 className="size-10" />
                  </span>

                  <h3 className="mt-4 font-serif text-2xl font-bold text-foreground">
                    {t.contact.successTitle || 'Message Received Successfully!'}
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {t.contact.successAlert}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:bg-secondary cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>{t.contact.sendAnother || 'Send Another Message'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, Volume2, Languages, Bot, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { sendPublicChatMessage } from '@/lib/api/chat'
import { speakText, stopAudio } from '@/lib/tts/sarvam-client'
import { useTranslation, languageLabels, type Language } from '@/lib/i18n/context'
import type { ChatMessage } from '@/lib/types/assessment'

let idCounter = 0
const nextId = () => `msg-${idCounter++}`

// Map locale to BCP-47 speech synthesis language tag
const speechLang: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  as: 'as-IN',
}

export function PublicChatbot() {
  const { t, language, setLanguage } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'assistant', text: t.chatbot.greeting },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset conversation when language changes
  useEffect(() => {
    setMessages([{ id: nextId(), role: 'assistant', text: t.chatbot.greeting }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  useEffect(() => {
    if (typeof scrollRef.current?.scrollTo === 'function') {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, open])

  function changeLang(next: Language) {
    // Write to shared context — also updates Settings and all other consumers
    setLanguage(next)
  }

  async function send() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { id: nextId(), role: 'user', text: trimmed }
    const placeholderId = nextId()
    const typingMsg: ChatMessage = { id: placeholderId, role: 'assistant', text: '', loading: true }

    setMessages((prev) => [...prev, userMsg, typingMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendPublicChatMessage(trimmed, language)
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...reply, id: placeholderId } : m)),
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { id: placeholderId, role: 'assistant', text: t.common.error + ' ' + t.common.tryAgain, error: true }
            : m,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  function speak(msg: ChatMessage) {
    if (speakingId === msg.id) {
      stopAudio()
      setSpeakingId(null)
      return
    }
    stopAudio()
    setSpeakingId(msg.id)
    speakText(
      msg.text,
      language,
      () => setSpeakingId(null),
      () => setSpeakingId(null)
    )
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close education assistant' : 'Open education assistant'}
        className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-5 bottom-24 z-50 flex h-[520px] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <Image
                src="/swastik-icon.png"
                alt="Swastik Assistant"
                width={36}
                height={36}
                className="size-9 rounded-full object-contain shrink-0 bg-white/10 p-0.5"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.chatbot.headerTitle}</p>
                <p className="text-xs text-primary-foreground/75">{t.chatbot.headerSubtitle}</p>
              </div>
            </div>

            {/* Language toggle — reads/writes shared context */}
            <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
              <Languages className="size-4 text-muted-foreground" />
              {(Object.keys(languageLabels) as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => changeLang(l)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    language === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-background'
                  }`}
                >
                  {languageLabels[l]}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : msg.error
                            ? 'rounded-bl-sm border border-destructive/30 bg-destructive/10 text-destructive'
                            : 'rounded-bl-sm bg-secondary text-foreground'
                      }`}
                    >
                      {msg.loading ? (
                        <span className="flex items-center gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="inline-block size-1.5 rounded-full bg-muted-foreground"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </span>
                      ) : msg.error ? (
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 shrink-0" />
                          {msg.text}
                        </span>
                      ) : (
                        <div 
                          className={`prose max-w-none text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground text-primary-foreground' 
                              : 'prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground text-foreground'
                          }`}
                        >
                          <ReactMarkdown>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    {msg.role === 'assistant' && !msg.loading && !msg.error && (
                      <button
                        type="button"
                        onClick={() => speak(msg)}
                        aria-label="Listen to this response"
                        className={`mt-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium transition-colors ${
                          speakingId === msg.id ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Volume2 className="size-3.5" />
                        {speakingId === msg.id ? t.chatbot.playing : t.chatbot.listenBtn}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border bg-background px-3 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send()
                }}
                placeholder={t.chatbot.inputPlaceholder}
                disabled={loading}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

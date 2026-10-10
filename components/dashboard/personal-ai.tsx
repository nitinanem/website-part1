'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Send, HeartHandshake, Sparkles, Activity, AlertCircle, RotateCcw, Volume2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { sendPersonalChatMessage, fetchPersonalChatHistory } from '@/lib/api/chat'
import { speakText } from '@/lib/tts/sarvam-client'
import type { ChatMessage, ChatSession } from '@/lib/types/assessment'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/components/session-provider'

let idCounter = 0
const nextId = () => `p-${idCounter++}`

export function PersonalAI() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const activePatientId = user?.patientId || user?.uid || undefined

  // Re-create initial greeting when language changes
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), role: 'assistant', text: t.assistant.initialGreeting, timestamp: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('personal-ai-current-session-id') || `session-${Date.now()}`
    }
    return `session-${Date.now()}`
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Update the initial greeting when language changes (only if it's still just the greeting)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ id: prev[0].id, role: 'assistant', text: t.assistant.initialGreeting, timestamp: prev[0].timestamp || Date.now() }]
      }
      return prev
    })
  }, [t.assistant.initialGreeting])

  // Load chat history from PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true
    async function loadHistory() {
      try {
        if (typeof fetchPersonalChatHistory !== 'function') return
        const storedSessionId = typeof window !== 'undefined' ? localStorage.getItem('personal-ai-current-session-id') : null
        const historyData = await fetchPersonalChatHistory(activePatientId, storedSessionId || undefined)
        if (isMounted && historyData?.messages && historyData.messages.length > 0) {
          setMessages(historyData.messages)
          if (historyData.sessionId) {
            setSessionId(historyData.sessionId)
            if (typeof window !== 'undefined') {
              localStorage.setItem('personal-ai-current-session-id', historyData.sessionId)
            }
          }
        }
      } catch (e) {
        console.warn('[PersonalAI] Failed to fetch chat history from DB:', e)
      }
    }
    loadHistory()
    return () => {
      isMounted = false
    }
  }, [activePatientId])

  // Save to local storage cache whenever messages change
  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].text !== t.assistant.initialGreeting)) {
      const saved = localStorage.getItem('personal-ai-chat-history')
      let history: ChatSession[] = []
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && (!parsed.length || 'messages' in parsed[0])) {
            history = parsed
          }
        } catch (e) {}
      }
      
      const sessionIndex = history.findIndex(s => s.id === sessionId)
      if (sessionIndex >= 0) {
        history[sessionIndex].messages = messages
      } else {
        history.unshift({
          id: sessionId,
          timestamp: Date.now(),
          messages: messages
        })
      }
      localStorage.setItem('personal-ai-chat-history', JSON.stringify(history))
    }
  }, [messages, t.assistant.initialGreeting, sessionId])

  useEffect(() => {
    if (typeof scrollRef.current?.scrollTo === 'function') {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  function startNewChat() {
    const newSessionId = `session-${Date.now()}`
    setSessionId(newSessionId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('personal-ai-current-session-id', newSessionId)
    }
    setMessages([{ id: nextId(), role: 'assistant', text: t.assistant.initialGreeting, timestamp: Date.now() }])
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { id: nextId(), role: 'user', text: trimmed, timestamp: Date.now() }
    const placeholderId = nextId()
    const typingMsg: ChatMessage = { id: placeholderId, role: 'assistant', text: '', loading: true, timestamp: Date.now() }

    // Grab history before adding the new messages
    const currentHistory = [...messages]

    setMessages((prev) => [...prev, userMsg, typingMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendPersonalChatMessage(trimmed, language, currentHistory, activePatientId || 'p1', sessionId)
      if (reply.sessionId && reply.sessionId !== sessionId) {
        setSessionId(reply.sessionId)
        if (typeof window !== 'undefined') {
          localStorage.setItem('personal-ai-current-session-id', reply.sessionId)
        }
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderId ? { ...reply, id: placeholderId, timestamp: Date.now() } : m)),
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { id: placeholderId, role: 'assistant', text: t.common.error + ' ' + t.common.tryAgain, error: true, timestamp: Date.now() }
            : m,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">{t.assistant.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.assistant.subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-border bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HeartHandshake className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-serif font-semibold">{t.assistant.chatTitle}</p>
              <p className="text-xs text-muted-foreground">{t.assistant.chatSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startNewChat}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Start a new conversation"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              New Chat
            </button>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/30 bg-accent px-3 py-1.5 text-xs font-semibold text-primary sm:self-auto">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <Sparkles className="size-3.5" aria-hidden="true" />
              {t.assistant.ragBadge}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <Image
                  src="/swastik-icon.png"
                  alt="Swastik AI"
                  width={32}
                  height={32}
                  className="mt-0.5 size-8 shrink-0 rounded-full object-contain shadow-xs"
                />
              )}
              <div
                className={`group relative max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : msg.error
                      ? 'rounded-bl-sm border border-destructive/30 bg-destructive/10 text-destructive'
                      : 'rounded-bl-sm bg-secondary text-foreground'
                }`}
              >
                {msg.loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="inline-block size-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted-foreground">{t.assistant.thinking}</span>
                  </span>
                ) : msg.error ? (
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 shrink-0" />
                    {msg.text}
                  </span>
                ) : (
                  <>
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
                    {/* Read Aloud Button */}
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => {
                          speakText(msg.text, language)
                        }}
                        className="absolute -right-10 bottom-0 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-primary group-hover:opacity-100"
                        title="Read Aloud"
                      >
                        <Volume2 className="size-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 border-t border-border px-5 pt-4">
          {t.assistant.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/40 hover:text-primary disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) send(input)
            }}
            placeholder={t.assistant.inputPlaceholder}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="size-4" aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

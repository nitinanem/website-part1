import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MessageSquare, Trash2, CalendarDays, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { ChatSession, ChatMessage } from '@/lib/types/assessment'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/components/session-provider'
import { fetchAllPersonalChatSessions } from '@/lib/api/chat'

export function ChatHistory() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  useEffect(() => {
    let isMounted = true

    async function loadAllHistory() {
      // 1. Initial immediate load from local storage cache
      let localSessions: ChatSession[] = []
      const saved = localStorage.getItem('personal-ai-chat-history')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            if ('role' in parsed[0]) {
              localSessions = [{
                id: 'legacy',
                timestamp: Date.now(),
                messages: parsed.filter((m: ChatMessage) => !m.loading && !m.error)
              }]
            } else {
              localSessions = parsed
            }
          }
        } catch (e) {}
      }

      if (isMounted && localSessions.length > 0) {
        setSessions(localSessions)
      }

      // 2. Fetch full conversation history from PostgreSQL
      try {
        const patientId = user?.patientId || user?.uid
        const dbSessions = await fetchAllPersonalChatSessions(patientId)

        if (isMounted && dbSessions && dbSessions.length > 0) {
          // Merge dbSessions and localSessions (dbSessions take precedence)
          const dbIds = new Set(dbSessions.map((s) => s.id))
          const nonDuplicateLocal = localSessions.filter((s) => !dbIds.has(s.id))
          const merged = [...dbSessions, ...nonDuplicateLocal].sort(
            (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
          )

          setSessions(merged)
          try {
            localStorage.setItem('personal-ai-chat-history', JSON.stringify(merged))
          } catch (e) {}
        }
      } catch (err) {
        console.warn('[ChatHistory] Failed to load sessions from DB:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadAllHistory()

    return () => {
      isMounted = false
    }
  }, [user?.patientId, user?.uid])

  function clearHistory() {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      localStorage.removeItem('personal-ai-chat-history')
      setSessions([])
    }
  }

  const groupedSessions = sessions.reduce((acc, session) => {
    const date = new Date(session.timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let label = date.toLocaleDateString()
    if (date.toDateString() === today.toDateString()) label = 'Today'
    else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    
    if (!acc[label]) acc[label] = []
    acc[label].push(session)
    return acc
  }, {} as Record<string, ChatSession[]>)

  if (loading && sessions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-2xl border border-border bg-card p-8 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading chat history from database...</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 rounded-2xl border border-border bg-card p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <MessageSquare className="size-8" />
        </span>
        <div>
          <h2 className="font-serif text-xl font-bold">No Chat History</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your conversations with the Personal AI will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">Chat History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review your past conversations with the AI.</p>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="size-4" />
          Clear History
        </button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto pb-8">
        {Object.entries(groupedSessions).map(([dateLabel, dateSessions]) => (
          <div key={dateLabel}>
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="size-4.5" />
              {dateLabel}
            </div>
            
            <div className="space-y-4">
              {dateSessions.map((session, sIdx) => {
                const isExpanded = expandedId === session.id
                
                // Exclude the initial greeting from preview
                const userMessages = session.messages.filter(m => m.role === 'user')
                const previewText = userMessages.length > 0 
                  ? userMessages[0].text 
                  : session.messages[session.messages.length - 1]?.text || 'Empty session'
                
                const timeString = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <div key={session.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-secondary/40"
                    >
                      <div>
                        <p className="font-medium text-foreground">Session {dateSessions.length - sIdx} <span className="text-muted-foreground font-normal ml-2 text-sm">{timeString}</span></p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{previewText}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-border bg-secondary/10 p-6 space-y-6">
                        {session.messages.map((msg, idx) => (
                          <div key={msg.id || idx} className="flex gap-4">
                            {msg.role === 'user' ? (
                              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                U
                              </span>
                            ) : (
                              <Image
                                src="/swastik-icon.png"
                                alt="Swastik Assistant"
                                width={32}
                                height={32}
                                className="mt-0.5 size-8 shrink-0 rounded-full object-contain shadow-xs"
                              />
                            )}
                            <div>
                              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                {msg.role === 'user' ? 'You' : 'Assistant'}
                                {msg.timestamp && (
                                  <span className="ml-2 font-normal opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm leading-relaxed text-foreground">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import type { ChatMessage, ChatSession, Language } from '@/lib/types/assessment'

// ─── Response helpers ─────────────────────────────────────────────────────────
let msgCounter = 0
const nextId = () => `msg-${msgCounter++}`

// ─── Public education chatbot ─────────────────────────────────────────────────

// Fallback in-memory replies used when the RAG backend returns 503
// (GEMINI_API_KEY not configured) or on network error.
const fallbackReplies: Record<Language, string[]> = {
  en: [
    'Great question. Staying active with low-impact exercise like walking or swimming helps strengthen the muscles around your joints and can reduce OA pain over time.',
    'For joint-friendly nutrition, focus on omega-3 rich foods, colourful vegetables, and maintaining a healthy weight to reduce pressure on your joints.',
    'Morning stiffness is very common with OA. Gentle stretching and gradual movement usually helps. If it lasts longer than an hour, consider consulting a professional.',
    'OA is the most common form of arthritis — it happens when the protective cartilage on the ends of bones wears down. It\'s manageable with the right lifestyle changes.',
    'Weight management is one of the most impactful things you can do. Even a 5% reduction in body weight can significantly reduce knee-joint load.',
  ],
  hi: [
    'बढ़िया सवाल। चलने या तैराकी जैसे कम प्रभाव वाले व्यायाम से जोड़ों के आसपास की मांसपेशियाँ मजबूत होती हैं और OA का दर्द कम हो सकता है।',
    'जोड़ों के लिए अच्छे पोषण हेतु ओमेगा-3 युक्त भोजन, रंगीन सब्जियाँ खाएँ और स्वस्थ वजन बनाए रखें।',
    'सुबह की जकड़न OA में आम है। हल्की स्ट्रेचिंग मदद करती है। यदि यह एक घंटे से अधिक रहे तो पेशेवर से सलाह लें।',
  ],
  pa: [
    'ਵਧੀਆ ਸਵਾਲ। ਤੁਰਨ ਜਾਂ ਤੈਰਾਕੀ ਵਰਗੀ ਘੱਟ-ਪ੍ਰਭਾਵ ਵਾਲੀ ਕਸਰਤ ਜੋੜਾਂ ਦੇ ਆਲੇ-ਦੁਆਲੇ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰਦੀ ਹੈ।',
    'ਜੋੜਾਂ ਲਈ ਚੰਗੀ ਖੁਰਾਕ ਵਾਸਤੇ ਓਮੇਗਾ-3 ਵਾਲਾ ਭੋਜਨ, ਰੰਗੀਨ ਸਬਜ਼ੀਆਂ ਖਾਓ ਅਤੇ ਸਿਹਤਮੰਦ ਭਾਰ ਰੱਖੋ।',
    'ਸਵੇਰ ਦੀ ਅਕੜਨ OA ਵਿੱਚ ਆਮ ਹੈ। ਹਲਕੀ ਸਟ੍ਰੈਚਿੰਗ ਮਦਦ ਕਰਦੀ ਹੈ।',
  ],
  bn: [
    'চমৎকার প্রশ্ন। হাঁটা বা সাঁতারের মতো কম-প্রভাবের ব্যায়াম জয়েন্টের চারপাশের পেশি শক্তিশালী করে এবং OA এর ব্যথা কমাতে সাহায্য করে।',
    'জয়েন্ট-বান্ধব পুষ্টির জন্য ওমেগা-৩ সমৃদ্ধ খাবার, রঙিন শাকসবজি খান এবং সুস্থ ওজন বজায় রাখুন।',
    'সকালের জড়তা OA তে খুব সাধারণ। মৃদু স্ট্রেচিং সাধারণত সাহায্য করে।',
  ],
  as: [
    'ভাল প্ৰশ্ন। খোজ কঢ়া বা সাঁতোৰৰ দৰে কম-প্ৰভাৱৰ ব্যায়ামে গাঁঠিৰ চাৰিওফালৰ পেশীবোৰ শক্তিশালী কৰে।',
    'গাঁঠি-বন্ধুত্বপূৰ্ণ পুষ্টিৰ বাবে ওমেগা-৩ সমৃদ্ধ খাদ্য, ৰঙীন পাচলি খাওক আৰু স্বাস্থ্যকৰ ওজন বজাই ৰাখক।',
    'ৰাতিপুৱাৰ কঠিনতা OA ত সাধাৰণ। মৃদু ষ্ট্ৰেচিংয়ে সাধাৰণতে সহায় কৰে।',
  ],
}

const fallbackCounters: Record<Language, number> = { en: 0, hi: 0, pa: 0, bn: 0, as: 0 }

/**
 * Sends a message to the RAG-backed public education chatbot.
 * Calls POST /api/chat/public; falls back to in-memory replies on 503 (no LLM key)
 * or network error so the UI always gets a response.
 */
export async function sendPublicChatMessage(
  query: string,
  lang: Language,
  history: ChatMessage[] = [],
  sessionId?: string,
): Promise<ChatMessage> {
  try {
    const res = await fetch('/api/chat/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        lang,
        sessionId,
        history: history.slice(-6).map((m) => ({ role: m.role, text: m.text })),
      }),
    })

    const data = await res.json()

    // 503 = GEMINI_API_KEY not set → graceful fallback
    if (res.status === 503) {
      console.warn('[chat] RAG backend not configured, using fallback replies')
      return getFallbackReply(lang)
    }

    if (!res.ok) {
      throw new Error(data?.message ?? `HTTP ${res.status}`)
    }

    return {
      id: data.id ?? nextId(),
      role: 'assistant',
      text: data.text,
      sessionId: data.sessionId,
      sources: data.sources,
    }
  } catch (err) {
    console.error('[sendPublicChatMessage] error:', err)
    return getFallbackReply(lang)
  }
}

function getFallbackReply(lang: Language): ChatMessage {
  const replies = fallbackReplies[lang]
  const text = replies[fallbackCounters[lang]++ % replies.length]
  return { id: nextId(), role: 'assistant', text }
}

/**
 * Sends a message to the personalised dashboard assistant.
 * It retrieves both general OA context and the patient's specific journal
 * entries on the backend to provide empathetic, context-aware answers.
 * Persists the message and conversation session to PostgreSQL.
 */
export async function sendPersonalChatMessage(
  query: string,
  lang: Language = 'en',
  history: ChatMessage[] = [],
  patientId: string = 'p1',
  sessionId?: string,
): Promise<ChatMessage> {
  try {
    const res = await fetch('/api/chat/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        lang,
        patientId,
        sessionId,
        history: history.slice(-6).map((m) => ({ role: m.role, text: m.text })),
      }),
    })

    const data = await res.json()

    if (res.status === 503) {
      console.warn('[chat] RAG backend not configured, using fallback')
      return { id: nextId(), role: 'assistant', text: 'I am here to support you. However, my AI connection is currently offline.' }
    }

    if (!res.ok) {
      throw new Error(data?.message ?? `HTTP ${res.status}`)
    }

    return {
      id: data.id ?? nextId(),
      role: 'assistant',
      text: data.text,
      sessionId: data.sessionId,
      sources: data.sources,
    }
  } catch (err) {
    console.error('[sendPersonalChatMessage] error:', err)
    return { id: nextId(), role: 'assistant', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }
  }
}

/**
 * Fetches stored chat history for a patient or specific chat session from the database.
 */
export async function fetchPersonalChatHistory(
  patientId?: string,
  sessionId?: string,
): Promise<{ sessionId: string | null; messages: ChatMessage[] }> {
  try {
    const params = new URLSearchParams()
    if (patientId) params.set('patientId', patientId)
    if (sessionId) params.set('sessionId', sessionId)

    const res = await fetch(`/api/chat/personal?${params.toString()}`)
    if (!res.ok) return { sessionId: null, messages: [] }

    const data = await res.json()
    return {
      sessionId: data.sessionId ?? null,
      messages: (data.messages ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
        sources: m.sources,
      })),
    }
  } catch (err) {
    console.error('[fetchPersonalChatHistory] error:', err)
    return { sessionId: null, messages: [] }
  }
}

/**
 * Fetches all stored chat sessions and their messages for a patient from the database.
 */
export async function fetchAllPersonalChatSessions(
  patientId?: string,
): Promise<ChatSession[]> {
  try {
    const params = new URLSearchParams({ all: 'true' })
    if (patientId) params.set('patientId', patientId)

    const res = await fetch(`/api/chat/personal?${params.toString()}`)
    if (!res.ok) return []

    const data = await res.json()
    return (data.sessions ?? []).map((s: any) => ({
      id: s.id,
      timestamp: s.timestamp || Date.now(),
      title: s.title,
      messages: (s.messages ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
        sources: m.sources,
      })),
    }))
  } catch (err) {
    console.error('[fetchAllPersonalChatSessions] error:', err)
    return []
  }
}

/**
 * Fetches stored chat history for a public chat session from the database.
 */
export async function fetchPublicChatHistory(
  sessionId: string,
): Promise<{ sessionId: string | null; messages: ChatMessage[] }> {
  try {
    const res = await fetch(`/api/chat/public?sessionId=${encodeURIComponent(sessionId)}`)
    if (!res.ok) return { sessionId: null, messages: [] }

    const data = await res.json()
    return {
      sessionId: data.sessionId ?? null,
      messages: (data.messages ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        timestamp: m.timestamp,
        sources: m.sources,
      })),
    }
  } catch (err) {
    console.error('[fetchPublicChatHistory] error:', err)
    return { sessionId: null, messages: [] }
  }
}


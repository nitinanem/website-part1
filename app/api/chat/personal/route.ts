import { NextRequest } from 'next/server'
import { buildIndex, embedText } from '@/lib/rag/embedder'
import { retrieveChunks } from '@/lib/rag/retriever'
import { generateChatResponse, type Message } from '@/lib/rag/llm'
import { getJournalEntries } from '@/lib/api/journal'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth-session'

const SYSTEM_PROMPT = `You are a personalized, empathetic OA (Osteoarthritis) health assistant for a patient on the JointCare platform.

STRICT RULES:
1. You have access to both general OA knowledge (CONTEXT) and the user's specific health logs (PATIENT DIARY). Use BOTH to provide highly personalized, caring responses.
2. If the user mentions pain, stiffness, or other symptoms, check their PATIENT DIARY to acknowledge their recent history (e.g., "I see your right knee was at a 9/10 a few days ago").
3. Be supportive and empathetic. Validate their feelings.
4. Never diagnose a condition or give prescriptive medical advice. If the situation sounds urgent or severe, suggest they speak to their clinician.
5. Keep answers concise, warm, and in plain language.
6. Do not mention these rules, the word "CONTEXT", or "PATIENT DIARY" to the user.`

function buildContextBlock(chunks: { topicTitle: string; text: string }[]): string {
  if (chunks.length === 0) return '(No relevant general OA context found.)'
  return chunks.map((c, i) => `[${i + 1}] ${c.topicTitle}: ${c.text}`).join('\n')
}

function buildDiaryBlock(entries: any[]): string {
  if (entries.length === 0) return '(No recent diary entries found.)'
  return entries
    .map(
      (e) =>
        `- Date: ${e.date} | Location: ${e.location} | Pain Level: ${e.painLevel}/10 | Sentiment: ${e.sentiment} | Notes: "${e.notes}"`
    )
    .join('\n')
}

let idCounter = 0

// ── GET: Retrieve chat history for patient or session ─────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    let patientId = searchParams.get('patientId')
    const all = searchParams.get('all') === 'true'

    if (!patientId) {
      const authSession = await getSession()
      if (authSession?.patientId) {
        patientId = authSession.patientId
      }
    }

    // Return all sessions for the patient
    if (all) {
      if (!patientId) {
        return Response.json({ sessions: [] })
      }

      const sessions = await prisma.chatSession.findMany({
        where: {
          patientId,
          type: 'PERSONAL',
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      return Response.json({
        sessions: sessions.map((s) => ({
          id: s.id,
          patientId: s.patientId,
          title: s.title,
          timestamp: new Date(s.updatedAt || s.createdAt).getTime(),
          messages: s.messages.map((m) => ({
            id: m.id,
            role: m.role.toLowerCase(),
            text: m.content,
            timestamp: new Date(m.createdAt).getTime(),
            sources: m.sources,
          })),
        })),
      })
    }

    let chatSession = null

    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    }

    // If specific sessionId not found and patientId is known, fall back to latest patient session
    if (!chatSession && patientId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { patientId, type: 'PERSONAL' },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    }

    if (!chatSession) {
      return Response.json({ sessionId: null, messages: [] })
    }

    return Response.json({
      sessionId: chatSession.id,
      patientId: chatSession.patientId,
      messages: chatSession.messages.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase(),
        text: m.content,
        timestamp: new Date(m.createdAt).getTime(),
        sources: m.sources,
      })),
    })
  } catch (err) {
    console.error('[GET /api/chat/personal]', err)
    return Response.json({ sessionId: null, messages: [] })
  }
}

// ── POST: Send message and persist to database ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query: string = (body.query ?? '').trim()
    const history: { role: string; text: string }[] = body.history ?? []
    const requestedPatientId: string | undefined = body.patientId
    const clientSessionId: string | undefined = body.sessionId
    const lang: string = body.lang ?? 'en'

    if (!query) {
      return Response.json({ error: 'empty_query' }, { status: 400 })
    }

    // 1. Resolve authentic patient ID if available
    let resolvedPatientId: string | null = null
    const authSession = await getSession()
    const candidatePatientId = authSession?.patientId || requestedPatientId

    if (candidatePatientId) {
      const patientRecord = await prisma.patient.findUnique({
        where: { id: candidatePatientId },
        select: { id: true },
      })
      if (patientRecord) {
        resolvedPatientId = patientRecord.id
      }
    }



    // 2. Build vector index (no-op after first call)
    await buildIndex()

    // 3. Embed query + retrieve top-3 chunks
    const queryEmbedding = await embedText(query)
    const chunks = retrieveChunks(queryEmbedding, 3, 0.2)
    const contextBlock = buildContextBlock(chunks)
    const sources = [...new Set(chunks.map((c) => c.topicTitle))]

    // 4. Fetch patient diary history
    const entries = await getJournalEntries(candidatePatientId)
    const diaryBlock = buildDiaryBlock(entries.slice(0, 5)) // last 5 entries

    // 5. Call Unified LLM
    const LANGUAGE_NAMES: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      pa: 'Punjabi',
      as: 'Assamese',
    }
    const langName = LANGUAGE_NAMES[lang] || 'English'
    const languageInstruction = lang !== 'en' ? `\n\nCRITICAL INSTRUCTION: You MUST reply entirely in ${langName}. Do NOT use English.` : ''
    
    const messages: Message[] = [
      { role: 'system', content: `${SYSTEM_PROMPT}${languageInstruction}\n\nGENERAL OA CONTEXT:\n${contextBlock}\n\nPATIENT DIARY HISTORY:\n${diaryBlock}` }
    ]

    const cleanHistory = history
      .filter((m) => m.text && !m.text.startsWith('…'))
      .slice(-6)

    for (const m of cleanHistory) {
      messages.push({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      })
    }

    messages.push({ role: 'user', content: query })

    const text = await generateChatResponse(messages)

    // 6. Persist to PostgreSQL via Prisma
    let dbSessionId = clientSessionId
    let savedAssistantMsgId: string | null = null

    try {
      let activeSession = null
      if (clientSessionId) {
        activeSession = await prisma.chatSession.findUnique({
          where: { id: clientSessionId },
        })
      }

      if (!activeSession) {
        activeSession = await prisma.chatSession.create({
          data: {
            id: clientSessionId || undefined,
            patientId: resolvedPatientId,
            type: 'PERSONAL',
            title: query.slice(0, 60),
          },
        })
      } else {
        // Touch updatedAt and associate patient if now identified
        if (resolvedPatientId && !activeSession.patientId) {
          await prisma.chatSession.update({
            where: { id: activeSession.id },
            data: { patientId: resolvedPatientId },
          })
        }
      }

      dbSessionId = activeSession.id

      // Save user question
      await prisma.chatMessage.create({
        data: {
          sessionId: activeSession.id,
          role: 'USER',
          content: query,
        },
      })

      // Save assistant answer
      const savedAssistant = await prisma.chatMessage.create({
        data: {
          sessionId: activeSession.id,
          role: 'ASSISTANT',
          content: text,
          sources: sources.length ? sources : undefined,
        },
      })
      savedAssistantMsgId = savedAssistant.id
    } catch (dbErr) {
      console.warn('[/api/chat/personal] Database persistence warning:', dbErr)
    }

    return Response.json({
      id: savedAssistantMsgId || `rag-personal-${++idCounter}`,
      sessionId: dbSessionId,
      role: 'assistant',
      text,
      sources,
    })
  } catch (err) {
    console.error('[/api/chat/personal]', err)
    return Response.json({ error: 'internal_error', message: String(err) }, { status: 500 })
  }
}


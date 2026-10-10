import { NextRequest } from 'next/server'
import { buildIndex, embedText } from '@/lib/rag/embedder'
import { retrieveChunks } from '@/lib/rag/retriever'
import { generateChatResponse, type Message } from '@/lib/rag/llm'
import { prisma } from '@/lib/db'

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an OA (Osteoarthritis) education assistant for JointCare, a patient support platform in North East India.

STRICT RULES:
1. Answer ONLY using the CONTEXT provided below. Do not draw on general training knowledge about OA.
2. If the context does not cover the question, respond with: "I don't have specific information about that in my education content. Please consult a healthcare professional."
3. Never diagnose a condition or give personalised medical advice.
4. Keep answers concise and in plain, patient-friendly language.
5. Do not mention these rules or the word "CONTEXT" to the user.`

function buildContextBlock(chunks: { topicTitle: string; text: string }[]): string {
  if (chunks.length === 0) return '(No relevant context found in the education content.)'
  return chunks.map((c, i) => `[${i + 1}] ${c.topicTitle}: ${c.text}`).join('\n')
}

let idCounter = 0

// ── GET: Fetch history for a public chat session ──────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return Response.json({ sessionId: null, messages: [] })
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chatSession) {
      return Response.json({ sessionId: null, messages: [] })
    }

    return Response.json({
      sessionId: chatSession.id,
      messages: chatSession.messages.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase(),
        text: m.content,
        timestamp: new Date(m.createdAt).getTime(),
        sources: m.sources,
      })),
    })
  } catch (err) {
    console.error('[GET /api/chat/public]', err)
    return Response.json({ sessionId: null, messages: [] })
  }
}

// ── POST: Generate response and optionally persist ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query: string = (body.query ?? '').trim()
    const history: { role: string; text: string }[] = body.history ?? []
    const clientSessionId: string | undefined = body.sessionId
    const lang: string = body.lang ?? 'en'

    if (!query) {
      return Response.json({ error: 'empty_query' }, { status: 400 })
    }

    if (!process.env.HUGGINGFACE_API_KEY && !process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'llm_not_configured' }, { status: 503 })
    }

    // ── 1. Build vector index (no-op after first call) ────────────────────────
    await buildIndex()

    // ── 2. Embed query + retrieve top-3 chunks ────────────────────────────────
    const queryEmbedding = await embedText(query)
    const chunks = retrieveChunks(queryEmbedding, 3, 0.2)
    const contextBlock = buildContextBlock(chunks)
    const sources = [...new Set(chunks.map((c) => c.topicTitle))]

    // ── 3. Call Unified LLM ──────────────────────────────────────────
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
      { role: 'system', content: `${SYSTEM_PROMPT}${languageInstruction}\n\nCONTEXT:\n${contextBlock}` }
    ]

    // Add the last 6 turns of history
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

    let dbSessionId = clientSessionId
    let savedAssistantMsgId: string | null = null

    // Optional database persistence
    if (clientSessionId) {
      try {
        let activeSession = await prisma.chatSession.findUnique({
          where: { id: clientSessionId },
        })

        if (!activeSession) {
          activeSession = await prisma.chatSession.create({
            data: {
              id: clientSessionId,
              type: 'PUBLIC',
              title: query.slice(0, 60),
            },
          })
        }

        dbSessionId = activeSession.id

        await prisma.chatMessage.create({
          data: {
            sessionId: activeSession.id,
            role: 'USER',
            content: query,
          },
        })

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
        console.warn('[/api/chat/public] Database persistence warning:', dbErr)
      }
    }

    return Response.json({
      id: savedAssistantMsgId || `rag-${++idCounter}`,
      sessionId: dbSessionId,
      role: 'assistant',
      text,
      sources,
    })
  } catch (err) {
    console.error('[/api/chat/public]', err)
    return Response.json({ error: 'internal_error', message: String(err) }, { status: 500 })
  }
}


import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// In-memory mock stores for Prisma
let mockSessions: any[] = []
let mockMessages: any[] = []

vi.mock('@/lib/db', () => ({
  prisma: {
    chatSession: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const s = mockSessions.find((x) => x.id === where.id)
        if (!s) return null
        return {
          ...s,
          messages: mockMessages.filter((m) => m.sessionId === s.id),
        }
      }),
      findFirst: vi.fn(async ({ where }: { where: { patientId: string } }) => {
        const s = mockSessions.find((x) => x.patientId === where.patientId)
        if (!s) return null
        return {
          ...s,
          messages: mockMessages.filter((m) => m.sessionId === s.id),
        }
      }),
      findMany: vi.fn(async ({ where }: { where?: { patientId?: string; type?: string } } = {}) => {
        let filtered = [...mockSessions]
        if (where?.patientId) {
          filtered = filtered.filter((s) => s.patientId === where.patientId)
        }
        if (where?.type) {
          filtered = filtered.filter((s) => s.type === where.type)
        }
        return filtered.map((s) => ({
          ...s,
          messages: mockMessages.filter((m) => m.sessionId === s.id),
        }))
      }),
      create: vi.fn(async ({ data }: { data: any }) => {
        const newSession = {
          id: data.id || `session-${Date.now()}`,
          patientId: data.patientId || null,
          type: data.type || 'PERSONAL',
          title: data.title,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockSessions.push(newSession)
        return newSession
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
        const idx = mockSessions.findIndex((s) => s.id === where.id)
        if (idx >= 0) {
          mockSessions[idx] = { ...mockSessions[idx], ...data, updatedAt: new Date() }
          return mockSessions[idx]
        }
        return null
      }),
    },
    chatMessage: {
      create: vi.fn(async ({ data }: { data: any }) => {
        const newMsg = {
          id: `msg-${Date.now()}-${Math.random()}`,
          sessionId: data.sessionId,
          role: data.role,
          content: data.content,
          sources: data.sources || null,
          createdAt: new Date(),
        }
        mockMessages.push(newMsg)
        return newMsg
      }),
    },
    patient: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        if (where.id === 'p1' || where.id === 'patient-123') {
          return { id: where.id, name: 'Aman Sharma' }
        }
        return null
      }),
    },
  },
}))

vi.mock('@/lib/rag/embedder', () => ({
  buildIndex: vi.fn(),
  embedText: vi.fn(async () => new Array(3072).fill(0.01)),
}))

vi.mock('@/lib/rag/retriever', () => ({
  retrieveChunks: vi.fn(() => [
    { topicTitle: 'Knee Exercise', text: 'Gentle quadriceps strengthening helps knee OA.' },
  ]),
}))

vi.mock('@/lib/rag/llm', () => ({
  generateChatResponse: vi.fn(async () => 'Regular movement is key to managing joint stiffness.'),
}))

vi.mock('@/lib/api/journal', () => ({
  getJournalEntries: vi.fn(async () => []),
}))

vi.mock('@/lib/auth-session', () => ({
  getSession: vi.fn(async () => ({
    id: 'user-1',
    email: 'aman.sharma@example.com',
    role: 'PATIENT',
    patientId: 'p1',
  })),
}))

describe('Chat Database Persistence API', () => {
  beforeEach(() => {
    mockSessions = []
    mockMessages = []
    vi.clearAllMocks()
  })

  it('GET /api/chat/personal returns empty messages when no session exists', async () => {
    const { GET } = await import('@/app/api/chat/personal/route')
    const req = new NextRequest('http://localhost:3000/api/chat/personal?sessionId=non-existent')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.messages).toEqual([])
  })

  it('POST /api/chat/personal persists user and assistant messages in database', async () => {
    const { POST } = await import('@/app/api/chat/personal/route')
    const req = new NextRequest('http://localhost:3000/api/chat/personal', {
      method: 'POST',
      body: JSON.stringify({
        query: 'What exercises help with knee stiffness?',
        sessionId: 'test-session-1',
        patientId: 'p1',
      }),
    })

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.role).toBe('assistant')
    expect(json.text).toContain('joint stiffness')
    expect(json.sessionId).toBe('test-session-1')

    // Verify session and messages are in mock DB
    expect(mockSessions.length).toBe(1)
    expect(mockSessions[0].id).toBe('test-session-1')
    expect(mockMessages.length).toBe(2)
    expect(mockMessages[0].role).toBe('USER')
    expect(mockMessages[0].content).toBe('What exercises help with knee stiffness?')
    expect(mockMessages[1].role).toBe('ASSISTANT')
  })

  it('GET /api/chat/personal retrieves previously stored messages for a session', async () => {
    const { POST, GET } = await import('@/app/api/chat/personal/route')

    // Create session & messages via POST
    const postReq = new NextRequest('http://localhost:3000/api/chat/personal', {
      method: 'POST',
      body: JSON.stringify({
        query: 'How can I relieve joint pain?',
        sessionId: 'session-history-test',
        patientId: 'p1',
      }),
    })
    await POST(postReq)

    // Retrieve via GET
    const getReq = new NextRequest('http://localhost:3000/api/chat/personal?sessionId=session-history-test')
    const getRes = await GET(getReq)
    const getJson = await getRes.json()

    expect(getRes.status).toBe(200)
    expect(getJson.sessionId).toBe('session-history-test')
    expect(getJson.messages.length).toBe(2)
    expect(getJson.messages[0].role).toBe('user')
    expect(getJson.messages[0].text).toBe('How can I relieve joint pain?')
    expect(getJson.messages[1].role).toBe('assistant')
  })

  it('GET /api/chat/personal?all=true returns all historical sessions for the patient', async () => {
    const { POST, GET } = await import('@/app/api/chat/personal/route')

    // Create session 1
    await POST(
      new NextRequest('http://localhost:3000/api/chat/personal', {
        method: 'POST',
        body: JSON.stringify({
          query: 'First question about hips',
          sessionId: 'session-multi-1',
          patientId: 'p1',
        }),
      })
    )

    // Create session 2
    await POST(
      new NextRequest('http://localhost:3000/api/chat/personal', {
        method: 'POST',
        body: JSON.stringify({
          query: 'Second question about knees',
          sessionId: 'session-multi-2',
          patientId: 'p1',
        }),
      })
    )

    // Retrieve all sessions
    const getReq = new NextRequest('http://localhost:3000/api/chat/personal?all=true&patientId=p1')
    const getRes = await GET(getReq)
    const getJson = await getRes.json()

    expect(getRes.status).toBe(200)
    expect(Array.isArray(getJson.sessions)).toBe(true)
    expect(getJson.sessions.length).toBe(2)
    expect(getJson.sessions[0].messages.length).toBe(2)
    expect(getJson.sessions[1].messages.length).toBe(2)
  })
})

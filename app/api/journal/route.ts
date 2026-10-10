import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { classifySentiment } from '@/lib/sentiment/classifier'

async function resolvePatientId(requestedId?: string | null, sessionUser?: any): Promise<string | null> {
  if (requestedId && requestedId !== 'p1') {
    const p = await prisma.patient.findUnique({ where: { id: requestedId } })
    if (p) return p.id
  }

  if (sessionUser?.patientId) {
    return sessionUser.patientId
  }

  if (sessionUser?.userId) {
    const p = await prisma.patient.findUnique({ where: { userId: sessionUser.userId } })
    if (p) return p.id
  }

  if (sessionUser?.id) {
    const p = await prisma.patient.findFirst({
      where: { OR: [{ id: sessionUser.id }, { userId: sessionUser.id }] },
    })
    if (p) return p.id
  }

  const first = await prisma.patient.findFirst()
  return first?.id ?? null
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const patientId = await resolvePatientId(searchParams.get('patientId'), session.user)
    if (!patientId) return NextResponse.json({ error: 'patientId required' }, { status: 400 })

    const entries = await prisma.journalEntry.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(entries)
  } catch (err) {
    console.error('[GET /api/journal]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const patientId = await resolvePatientId(body.patientId, session.user)
    if (!patientId) {
      return NextResponse.json({ error: 'No valid patient found' }, { status: 400 })
    }

    // Run sentiment analysis
    const sentimentResult = classifySentiment(body.notes ?? '')

    const entry = await prisma.journalEntry.create({
      data: {
        patientId,
        date: body.date ?? new Date().toISOString().slice(0, 10),
        painLevel: Number(body.painLevel) || 0,
        location: body.location || 'Joint',
        notes: body.notes || '',
        sentiment: sentimentResult.flag,
        mobilityScore: body.mobilityScore !== undefined ? Number(body.mobilityScore) : null,
        klGrade: body.klGrade !== undefined ? Number(body.klGrade) : null,
        radiologyRecommended: body.radiologyRecommended ?? null,
        imageUrl: body.imageUrl || null,
        audioUrl: body.audioUrl || null,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('[POST /api/journal]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

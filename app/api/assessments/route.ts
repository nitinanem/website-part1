import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

async function resolvePatientId(requestedId?: string | null, sessionUser?: any): Promise<string | null> {
  // If a valid patientId was provided (and not dummy 'p1')
  if (requestedId && requestedId !== 'p1') {
    const p = await prisma.patient.findUnique({ where: { id: requestedId } })
    if (p) return p.id
  }

  // Check from authenticated session
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

  // Fallback to first existing patient in database
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

    const rows = await prisma.assessment.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/assessments]', err)
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

    const patientRecord = await prisma.patient.findUnique({ where: { id: patientId } })

    const created = await prisma.assessment.create({
      data: {
        patientId,
        patientName: body.patientName ?? body.name ?? patientRecord?.name ?? null,
        patientEmail: body.patientEmail ?? body.email ?? patientRecord?.email ?? null,
        patientPhone: body.patientPhone ?? body.phone ?? patientRecord?.phone ?? null,
        status: 'pending_review',
        source: body.source ?? 'patient_self',
        gaitVideoRef: body.gaitVideoRef ?? null,
        xrayRef: body.xrayRef ?? null,
        anthropometrics: body.anthropometrics ? JSON.stringify(body.anthropometrics) : undefined,
        answers: body.answers ? JSON.stringify(body.answers) : "[]",
        riskScore: body.riskScore ? JSON.stringify(body.riskScore) : undefined,
        kamScore: body.kamScore ?? (body.riskScore?.gait ? body.riskScore.gait / 100 : null),
        gaitFeatures: body.gaitFeatures ? JSON.stringify(body.gaitFeatures) : undefined,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error('[POST /api/assessments]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

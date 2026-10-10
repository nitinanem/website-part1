import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') ?? ''

    const patients = await prisma.patient.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
              { abhaId: { contains: query } },
            ],
          }
        : undefined,
      include: {
        doctor: { select: { id: true, name: true, specialization: true } },
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 50,
    })

    // Shape response to match existing Patient type
    const shaped = patients.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      phone: p.phone,
      email: p.email,
      gender: p.gender,
      primaryJoint: p.primaryJoint,
      abhaId: p.abhaId,
      emergencyContact: p.emergencyContact,
      allottedDoctorId: p.allottedDoctorId,
      latestAssessmentId: p.assessments[0]?.id ?? null,
      latestAssessmentStatus: p.assessments[0]?.status ?? null,
    }))

    return NextResponse.json(shaped)
  } catch (err) {
    console.error('[GET /api/patients]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const p = await prisma.patient.findUnique({
      where: { id },
      include: {
        assessments: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, status: true } },
      },
    })
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      id: p.id, name: p.name, age: p.age, phone: p.phone, email: p.email,
      gender: p.gender, primaryJoint: p.primaryJoint, abhaId: p.abhaId,
      emergencyContact: p.emergencyContact, allottedDoctorId: p.allottedDoctorId,
      latestAssessmentId: p.assessments[0]?.id ?? null,
      latestAssessmentStatus: p.assessments[0]?.status ?? null,
    })
  } catch (err) {
    console.error('[GET /api/patients/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const patch = await req.json()

    const ageValue =
      patch.age !== undefined
        ? patch.age === '' || patch.age === null
          ? null
          : typeof patch.age === 'number'
            ? patch.age
            : isNaN(Number(patch.age))
              ? null
              : Number(patch.age)
        : undefined

    // Safely validate and resolve allottedDoctorId to avoid foreign key violations
    let validDoctorId: string | null = null
    if (patch.allottedDoctorId) {
      const docExists = await prisma.doctor.findUnique({
        where: { id: patch.allottedDoctorId },
        select: { id: true },
      })
      if (docExists) {
        validDoctorId = docExists.id
      } else {
        const mockMap: Record<string, string> = {
          doc1: 'Dr. A. Sharma',
          doc2: 'Dr. R. Gupta',
          doc3: 'Dr. M. Patel',
        }
        const docName = mockMap[patch.allottedDoctorId] || patch.allottedDoctorId
        const docByName = await prisma.doctor.findFirst({
          where: { name: { contains: docName, mode: 'insensitive' } },
          select: { id: true },
        })
        if (docByName) {
          validDoctorId = docByName.id
        }
      }
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...(patch.name !== undefined && { name: patch.name.trim() }),
        ...(patch.email !== undefined && { email: patch.email.trim() }),
        ...(patch.phone !== undefined && { phone: patch.phone?.trim() ? patch.phone.trim() : null }),
        ...(ageValue !== undefined && { age: ageValue }),
        ...(patch.gender !== undefined && { gender: patch.gender ? patch.gender : null }),
        ...(patch.primaryJoint !== undefined && { primaryJoint: patch.primaryJoint ? patch.primaryJoint : null }),
        ...(patch.abhaId !== undefined && { abhaId: patch.abhaId?.trim() ? patch.abhaId.trim() : null }),
        ...(patch.emergencyContact !== undefined && { emergencyContact: patch.emergencyContact?.trim() ? patch.emergencyContact.trim() : null }),
        ...(patch.allottedDoctorId !== undefined && { allottedDoctorId: validDoctorId }),
      },
    })

    if (patch.name && session.user.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: patch.name.trim() },
      }).catch(() => {})
    }

    return NextResponse.json({ ...updated })
  } catch (err) {
    console.error('[PATCH /api/patients/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

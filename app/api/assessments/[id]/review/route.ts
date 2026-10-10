import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, note, reviewerId } = await req.json()
    const newStatus = action === 'confirm' ? 'confirmed' : 'flagged'

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: reviewerId ?? session.user.id,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[POST /api/assessments/[id]/review]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

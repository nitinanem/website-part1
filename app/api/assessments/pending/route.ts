import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rows = await prisma.assessment.findMany({
      where: { status: 'pending_review' },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/assessments/pending]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

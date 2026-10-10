import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Not a doctor' }, { status: 404 })
    }

    return NextResponse.json({ doctor })
  } catch (error) {
    console.error('[doctors_me]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

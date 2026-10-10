import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-session'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: session.id,
        uid: session.patientId || session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        patientId: session.patientId,
        doctorId: session.doctorId,
      },
    })
  } catch (err) {
    console.error('[GET /api/auth/me]', err)
    return NextResponse.json({ user: null })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSessionToken, SESSION_COOKIE_NAME, type SessionUser } from '@/lib/auth-session'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and 6-digit verification code are required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const cleanCode = code.toString().trim()

    // Find valid verification token
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: cleanCode,
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 })
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })
      return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 })
    }

    // Delete used token(s)
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Activate user
    const user = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
      include: {
        patient: { select: { id: true } },
        doctor: { select: { id: true } },
      },
    })

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
    }

    const token = createSessionToken(sessionUser)

    const res = NextResponse.json({
      success: true,
      message: 'Email successfully verified.',
      user: {
        id: user.id,
        uid: user.patient?.id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: user.patient?.id,
        doctorId: user.doctor?.id,
      },
    })

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return res
  } catch (err) {
    console.error('[POST /api/auth/verify-email]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

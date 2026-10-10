import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSessionToken, SESSION_COOKIE_NAME, type SessionUser } from '@/lib/auth-session'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        patient: true,
        doctor: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // If account has not verified their email yet, prompt verification challenge
    if (!user.emailVerified) {
      const { generateVerificationOtp, sendVerificationEmail } = await import('@/lib/email')
      const code = generateVerificationOtp()
      const expires = new Date(Date.now() + 15 * 60 * 1000)

      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      })

      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token: code,
          expires,
        },
      })

      const emailResult = await sendVerificationEmail({
        email: normalizedEmail,
        code,
        name: user.name || undefined,
        role: user.role,
      })

      return NextResponse.json({
        requiresVerification: true,
        email: normalizedEmail,
        previewCode: emailResult.previewCode,
        message: 'Your email address is not verified yet. We have sent a 6-digit verification code to your email.',
      }, { status: 200 })
    }

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

    // Set secure HTTP-only cookie
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return res
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

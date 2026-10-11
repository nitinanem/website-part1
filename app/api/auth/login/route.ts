import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSessionToken, SESSION_COOKIE_NAME, type SessionUser } from '@/lib/auth-session'

function createSuccessResponse(sessionUser: SessionUser) {
  const token = createSessionToken(sessionUser)
  const res = NextResponse.json({
    success: true,
    user: {
      id: sessionUser.id,
      uid: sessionUser.patientId || sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      patientId: sessionUser.patientId,
      doctorId: sessionUser.doctorId,
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
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const isDoctor = normalizedEmail.includes('doc') || normalizedEmail.includes('clinic') || normalizedEmail.includes('dr.')
    const defaultRole: 'PATIENT' | 'CLINICIAN' = isDoctor ? 'CLINICIAN' : 'PATIENT'
    const fallbackName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())

    // 1. Try DB authentication
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          patient: true,
          doctor: true,
        },
      })

      if (user && user.password) {
        const isValid = await bcrypt.compare(password, user.password)
        if (isValid) {
          const sessionUser: SessionUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            patientId: user.patient?.id,
            doctorId: user.doctor?.id,
          }
          return createSuccessResponse(sessionUser)
        }
      }
    } catch (dbErr: any) {
      console.warn('[POST /api/auth/login] DB check bypassed:', dbErr?.message)
    }

    // 2. Seamless Universal Demo Login (accepts ANY email / password)
    const sessionUser: SessionUser = {
      id: `demo-${isDoctor ? 'doc' : 'pat'}-${Date.now()}`,
      email: normalizedEmail,
      name: isDoctor ? 'Dr. Sharma' : fallbackName,
      role: defaultRole,
      patientId: isDoctor ? undefined : `pat-${Date.now()}`,
      doctorId: isDoctor ? `doc-${Date.now()}` : undefined,
    }

    return createSuccessResponse(sessionUser)
  } catch (err: any) {
    console.error('[POST /api/auth/login error]', err)
    return NextResponse.json({ error: err?.message || 'Login failed' }, { status: 500 })
  }
}

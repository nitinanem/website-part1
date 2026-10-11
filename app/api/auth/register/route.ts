import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateVerificationOtp, sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'PATIENT',
      registrationNumber,
      medicalCouncil,
    } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const targetRole = (role === 'STAFF' || role === 'DOCTOR' || role === 'CLINICIAN') ? 'CLINICIAN' : 'PATIENT'

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: targetRole,
        emailVerified: null,
      },
    })

    let patientId: string | undefined
    let doctorId: string | undefined

    // Auto-create linked Patient profile
    if (targetRole === 'PATIENT') {
      const patient = await prisma.patient.create({
        data: {
          userId: user.id,
          name,
          email: normalizedEmail,
          settings: {
            create: {
              language: 'en',
              dailyReminders: true,
              weeklyEmail: false,
            },
          },
        },
      })
      patientId = patient.id
    } else if (targetRole === 'CLINICIAN') {
      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          name,
          specialization: 'General Orthopedics',
          registrationNumber: registrationNumber ?? null,
          medicalCouncil: medicalCouncil ?? null,
        },
      })
      doctorId = doctor.id
    }

    // Generate 6-digit verification code
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

    return NextResponse.json(
      { 
        success: true, 
        requiresVerification: true,
        email: normalizedEmail,
        userId: user.id,
        patientId,
        doctorId,
        previewCode: emailResult.previewCode,
        message: 'Account created. Please enter the 6-digit verification code sent to your email.'
      }, 
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[register error]', err)
    const msg = err?.message || ''
    if (msg.includes("Can't reach database server") || msg.includes('DATABASE_URL') || msg.includes('tenant/user') || msg.includes('P1001') || msg.includes('connect ECONNREFUSED')) {
      return NextResponse.json({ error: 'Database connection error. Please verify your database configuration.' }, { status: 503 })
    }
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}

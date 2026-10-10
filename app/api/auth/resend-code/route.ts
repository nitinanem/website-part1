import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateVerificationOtp, sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json({ error: 'Account not found with this email.' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified. You can log in directly.' }, { status: 200 })
    }

    // Generate new OTP
    const code = generateVerificationOtp()
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    // Remove existing tokens for this email and insert new
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
      success: true,
      message: 'A fresh 6-digit verification code has been sent to your email.',
      previewCode: emailResult.previewCode,
    })
  } catch (err) {
    console.error('[POST /api/auth/resend-code]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

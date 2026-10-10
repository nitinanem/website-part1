import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { generateVerificationOtp, sendVerificationEmail } from '@/lib/email'

// Mock prisma
vi.mock('@/lib/db', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      patient: {
        create: vi.fn(),
      },
      doctor: {
        create: vi.fn(),
      },
      verificationToken: {
        findFirst: vi.fn(),
        create: vi.fn(),
        deleteMany: vi.fn(),
      },
    },
  }
})

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'msg_123' })
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockImplementation(() => ({
      sendMail: mockSendMail,
    })),
  },
}))

describe('Email Verification & Auth Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('lib/email.ts', () => {
    it('generates a 6-digit numeric OTP', () => {
      const otp1 = generateVerificationOtp()
      const otp2 = generateVerificationOtp()

      expect(otp1).toHaveLength(6)
      expect(/^\d{6}$/.test(otp1)).toBe(true)
      expect(/^\d{6}$/.test(otp2)).toBe(true)
    })

    it('sendVerificationEmail returns previewCode in dev mode when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASS

      const result = await sendVerificationEmail({
        email: 'test@example.com',
        code: '123456',
        name: 'Test User',
      })

      expect(result.success).toBe(true)
      expect(result.previewCode).toBe('123456')
    })

    it('sendVerificationEmail supports SMTP transport when SMTP_USER is set', async () => {
      process.env.SMTP_USER = 'smtp.test@example.com'
      process.env.SMTP_PASS = 'secret_smtp_pass'

      const result = await sendVerificationEmail({
        email: 'recipient@example.com',
        code: '998877',
      })

      expect(result.success).toBe(true)
      expect(mockSendMail).toHaveBeenCalled()

      delete process.env.SMTP_USER
      delete process.env.SMTP_PASS
    })
  })

  describe('POST /api/auth/verify-email', () => {
    it('returns 400 if email or code is missing', async () => {
      const { POST } = await import('@/app/api/auth/verify-email/route')
      const req = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toMatch(/required/i)
    })

    it('returns 400 if token is invalid or does not match', async () => {
      const { prisma } = await import('@/lib/db')
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(null)

      const { POST } = await import('@/app/api/auth/verify-email/route')
      const req = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com', code: '999999' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toMatch(/invalid/i)
    })

    it('returns 400 if token has expired and cleans it up', async () => {
      const { prisma } = await import('@/lib/db')
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({
        id: 'tok_1',
        identifier: 'user@example.com',
        token: '123456',
        expires: new Date(Date.now() - 1000), // expired 1s ago
      } as any)

      const { POST } = await import('@/app/api/auth/verify-email/route')
      const req = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com', code: '123456' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toMatch(/expired/i)
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'user@example.com' },
      })
    })

    it('successfully verifies email, deletes token, marks emailVerified, and sets session cookie', async () => {
      const { prisma } = await import('@/lib/db')
      vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({
        id: 'tok_valid',
        identifier: 'valid@example.com',
        token: '654321',
        expires: new Date(Date.now() + 1000 * 60 * 10), // valid for 10 more minutes
      } as any)

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: 'u_valid',
        email: 'valid@example.com',
        name: 'Valid User',
        role: 'PATIENT',
        emailVerified: new Date(),
        patient: { id: 'p_valid' },
        doctor: null,
      } as any)

      const { POST } = await import('@/app/api/auth/verify-email/route')
      const req = new NextRequest('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: 'valid@example.com', code: '654321' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('valid@example.com')
      expect(res.cookies.get('jointcare_session')).toBeDefined()
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'valid@example.com' },
      })
      expect(prisma.user.update).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/resend-code', () => {
    it('returns 400 if email is missing', async () => {
      const { POST } = await import('@/app/api/auth/resend-code/route')
      const req = new NextRequest('http://localhost:3000/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 404 if user not found', async () => {
      const { prisma } = await import('@/lib/db')
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

      const { POST } = await import('@/app/api/auth/resend-code/route')
      const req = new NextRequest('http://localhost:3000/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email: 'ghost@example.com' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(404)
    })

    it('returns notice if user is already verified', async () => {
      const { prisma } = await import('@/lib/db')
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u_done',
        email: 'done@example.com',
        emailVerified: new Date(),
      } as any)

      const { POST } = await import('@/app/api/auth/resend-code/route')
      const req = new NextRequest('http://localhost:3000/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email: 'done@example.com' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toMatch(/already verified/i)
    })

    it('issues a new verification token for unverified user', async () => {
      const { prisma } = await import('@/lib/db')
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u_unv',
        email: 'unv@example.com',
        emailVerified: null,
        name: 'Unverified User',
        role: 'PATIENT',
      } as any)

      const { POST } = await import('@/app/api/auth/resend-code/route')
      const req = new NextRequest('http://localhost:3000/api/auth/resend-code', {
        method: 'POST',
        body: JSON.stringify({ email: 'unv@example.com' }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.previewCode).toBeDefined()
      expect(prisma.verificationToken.create).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/login with unverified account', () => {
    it('prompts verification challenge if user email is not yet verified', async () => {
      const { prisma } = await import('@/lib/db')
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('SecretPass123', 10)

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'u_unverified_login',
        email: 'unv_login@example.com',
        name: 'Unverified Patient',
        role: 'PATIENT',
        password: hashedPassword,
        emailVerified: null, // NOT verified
        patient: { id: 'p_unv' },
        doctor: null,
      } as any)

      const { POST } = await import('@/app/api/auth/login/route')
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'unv_login@example.com',
          password: 'SecretPass123',
        }),
      })

      const res = await POST(req)
      expect(res.status).toBe(200)
      const data = await res.json()

      expect(data.requiresVerification).toBe(true)
      expect(data.email).toBe('unv_login@example.com')
      expect(data.previewCode).toBeDefined()
      // Crucial: no session cookie set yet
      expect(res.cookies.get('jointcare_session')).toBeUndefined()
      // A token was created in verificationToken
      expect(prisma.verificationToken.create).toHaveBeenCalled()
    })
  })
})

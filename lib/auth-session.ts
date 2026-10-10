import crypto from 'crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'jointcare_session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'jointcare-secure-session-secret-sih2026-ndu'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'PATIENT' | 'CLINICIAN' | 'ADMIN'
  patientId?: string
  doctorId?: string
}

interface SessionPayload {
  user: SessionUser
  expiresAt: number
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString('base64url')
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8')
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
}

/**
 * Creates a signed, tamper-proof session token.
 * Default expiration: 7 days.
 */
export function createSessionToken(user: SessionUser, maxAgeSeconds = 7 * 24 * 60 * 60): string {
  const payload: SessionPayload = {
    user,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  }
  const payloadStr = JSON.stringify(payload)
  const encodedPayload = base64UrlEncode(payloadStr)
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

/**
 * Verifies and decodes a signed session token.
 * Returns the SessionUser or null if expired/invalid.
 */
export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encodedPayload, signature] = parts
  const expectedSig = sign(encodedPayload)

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSig)
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null
  }

  try {
    const jsonStr = base64UrlDecode(encodedPayload)
    const payload: SessionPayload = JSON.parse(jsonStr)

    if (Date.now() > payload.expiresAt) {
      return null
    }

    return payload.user
  } catch {
    return null
  }
}

/**
 * Reads and verifies the session from incoming Next.js request cookies.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    return verifySessionToken(token)
  } catch {
    return null
  }
}

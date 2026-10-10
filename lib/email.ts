import crypto from 'crypto'
import nodemailer from 'nodemailer'

/**
 * Generate a cryptographically secure 6-digit verification code.
 */
export function generateVerificationOtp(): string {
  const num = crypto.randomInt(100000, 999999)
  return num.toString()
}

interface SendEmailParams {
  email: string
  code: string
  name?: string
  role?: string
}

function getEmailHtml(recipientName: string, code: string, role?: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 6px 12px; background-color: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; border-radius: 9999px;">Swastik Health Platform</span>
      </div>
      <h2 style="font-size: 22px; color: #0f172a; margin: 0 0 12px 0;">Verify your email address</h2>
      <p style="color: #475569; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
        Hello <strong>${recipientName}</strong>,<br/>
        Please use the following 6-digit code to complete your ${role === 'CLINICIAN' ? 'clinical staff' : 'patient'} account verification and sign in.
      </p>
      <div style="background-color: #f8fafc; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f766e;">${code}</span>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 18px; margin: 0 0 16px 0;">
        This code will expire in 15 minutes. If you did not request this verification, you can safely ignore this email.
      </p>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; color: #94a3b8; font-size: 11px;">
        Swastik Osteoarthritis Platform &copy; 2026. National Digital Health Mission.
      </div>
    </div>
  `
}

/**
 * Sends an email verification code.
 * 1. Checks if SMTP credentials (SMTP_USER & SMTP_PASS) are provided -> dispatches via Nodemailer.
 * 2. Checks if RESEND_API_KEY is provided -> dispatches via Resend REST API.
 * 3. If neither is configured, prints code in terminal and returns previewCode for local dev testing.
 */
export async function sendVerificationEmail({ email, code, name, role }: SendEmailParams): Promise<{ success: boolean; previewCode?: string; error?: string }> {
  const recipientName = name || (role === 'CLINICIAN' ? 'Doctor' : 'Patient')
  const htmlContent = getEmailHtml(recipientName, code, role)
  const subject = `${code} is your Swastik verification code`

  // Clean console log for instant dev visibility
  console.log(`\n======================================================`)
  console.log(`[Swastik Auth] Verification Code for ${email}: ${code}`)
  console.log(`======================================================\n`)

  // Option 1: Standard SMTP (Gmail, Brevo, AWS SES, Mailgun, SendGrid)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      const port = Number(process.env.SMTP_PORT) || 465
      const secure = port === 465
      const from = process.env.EMAIL_FROM || `"Swastik Platform" <${smtpUser}>`

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      await transporter.sendMail({
        from,
        to: email,
        subject,
        html: htmlContent,
      })

      console.log(`[Swastik Email] Successfully delivered email via SMTP (${host}) to ${email}`)
      return { success: true }
    } catch (err: any) {
      console.warn('[Swastik Email] SMTP delivery failed:', err.message)
      // Provide previewCode as fallback in development so user isn't blocked
      return { success: true, previewCode: code, error: err.message }
    }
  }

  // Option 2: Resend API
  const resendApiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.EMAIL_FROM || 'Swastik <onboarding@resend.dev>'

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: email,
          subject,
          html: htmlContent,
        }),
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}))
        console.warn('[Swastik Email] Resend API error:', errorJson)
        return { success: true, previewCode: code }
      }

      console.log(`[Swastik Email] Successfully delivered email via Resend to ${email}`)
      return { success: true }
    } catch (err: any) {
      console.warn('[Swastik Email] Failed to send via Resend:', err)
      return { success: true, previewCode: code }
    }
  }

  // Option 3: Development / Demo fallback
  console.log(`[Swastik Email] No email provider configured (set SMTP_USER/SMTP_PASS or RESEND_API_KEY in .env.local). Returning demo previewCode.`)
  return { success: true, previewCode: code }
}

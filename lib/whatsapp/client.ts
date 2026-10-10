/**
 * WhatsApp Cloud API client.
 *
 * Scope: outbound template messages only (exercise/appointment reminders).
 * Two-way messaging, data collection, or conversational WhatsApp are
 * explicitly out of scope per the product spec.
 *
 * ─── Required environment variables (set in .env.local) ──────────────────────
 *
 * WHATSAPP_ACCESS_TOKEN
 *   Permanent System User access token from your Meta Business account.
 *   How to get: Meta Business Suite → Settings → System Users → Generate token
 *   with whatsapp_business_messaging permission.
 *
 * WHATSAPP_PHONE_NUMBER_ID
 *   Numeric ID of your verified WhatsApp Business phone number.
 *   How to get: Meta Developer Console → Your App → WhatsApp → Getting Started
 *   → Phone number panel → Phone Number ID field.
 *
 * ─── Manual setup steps before this client can send real messages ─────────────
 *
 * 1. Create a Meta Developer App at https://developers.facebook.com
 *    → Add Product → WhatsApp
 * 2. Register a phone number (use the test number for dev, a real business
 *    number for production).
 * 3. Create and submit message templates in WhatsApp Manager → Message Templates.
 *    Templates must be approved by Meta (24–48 h typically).
 *    See lib/whatsapp/templates.ts for the expected template structure.
 * 4. Add credentials to .env.local (see above).
 *
 * ─── API Reference ────────────────────────────────────────────────────────────
 *   https://developers.facebook.com/docs/whatsapp/cloud-api/messages/message-templates
 */

// WhatsApp Cloud API base URL
const WA_API_BASE = 'https://graph.facebook.com/v20.0'

export type SendResult = {
  success: boolean
  messageId?: string
  error?: string
  recipient: string
}

/**
 * Send a pre-approved template message to a single recipient.
 *
 * @param to           Recipient phone number in E.164 format (e.g. +919876543210)
 * @param templateName Approved template name in WhatsApp Manager
 * @param languageCode Template language code (e.g. 'en_US')
 * @param components   Template variable components (header/body/button)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components: object[],
): Promise<SendResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  // ── Config guard ────────────────────────────────────────────────────────────
  if (!accessToken || !phoneNumberId) {
    const msg =
      'WhatsApp credentials not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.local'
    console.warn('[WhatsApp client]', msg)
    return { success: false, error: msg, recipient: to }
  }

  const url = `${WA_API_BASE}/${phoneNumberId}/messages`

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: components.length > 0 ? components : undefined,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.error?.message ?? `HTTP ${res.status}`
      console.error('[WhatsApp client] API error:', errMsg, JSON.stringify(data))
      return { success: false, error: errMsg, recipient: to }
    }

    const messageId: string = data?.messages?.[0]?.id
    return { success: true, messageId, recipient: to }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[WhatsApp client] Network error:', errMsg)
    return { success: false, error: errMsg, recipient: to }
  }
}

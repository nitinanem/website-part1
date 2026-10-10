/**
 * WhatsApp client — unit tests
 *
 * Tests: opt-in selection logic, config-guard (no credentials → soft fail, no throw),
 * mocked API call for opted-in patients.
 *
 * MOCK: global fetch — clearly named, never sends real WhatsApp messages.
 * No real credentials required for this test suite to pass.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── MOCK: global fetch — clearly named, never hits the real WhatsApp API ───────
const MOCK_WHATSAPP_FETCH = vi.fn()

describe('sendTemplateMessage — WhatsApp client', () => {
  beforeEach(() => {
    vi.resetModules()
    // Replace global fetch with our clearly-named mock
    global.fetch = MOCK_WHATSAPP_FETCH
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Remove credentials from env after each test
    delete process.env.WHATSAPP_ACCESS_TOKEN
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
  })

  it('returns {success: false, error: "not configured"} when no credentials set (no throw)', async () => {
    // No env vars set — credentials missing
    const { sendTemplateMessage } = await import('@/lib/whatsapp/client')

    const result = await sendTemplateMessage(
      '+919876543210',
      'oa_exercise_reminder',
      'en_US',
      [],
    )

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/not configured/i)
    // fetch should NEVER be called without credentials
    expect(MOCK_WHATSAPP_FETCH).not.toHaveBeenCalled()
  })

  it('calls the WhatsApp API with correct URL and payload when credentials are set', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789'

    // MOCK_WHATSAPP_FETCH simulates a successful API response
    MOCK_WHATSAPP_FETCH.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [{ id: 'wamid.test123' }] }),
    })

    const { sendTemplateMessage } = await import('@/lib/whatsapp/client')

    const result = await sendTemplateMessage(
      '+919876543210',
      'oa_exercise_reminder',
      'en_US',
      [{ type: 'body', parameters: [{ type: 'text', text: 'Aman' }] }],
    )

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('wamid.test123')
    expect(result.recipient).toBe('+919876543210')

    // Verify the URL contains the phone number ID
    const [url, options] = MOCK_WHATSAPP_FETCH.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('123456789')
    expect(url).toContain('messages')
    expect(options.method).toBe('POST')

    // Verify the payload structure
    const body = JSON.parse(options.body as string)
    expect(body.messaging_product).toBe('whatsapp')
    expect(body.to).toBe('+919876543210')
    expect(body.template.name).toBe('oa_exercise_reminder')
  })

  it('returns {success: false, error} on API error response (no throw)', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789'

    MOCK_WHATSAPP_FETCH.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Invalid OAuth access token' } }),
    })

    const { sendTemplateMessage } = await import('@/lib/whatsapp/client')

    const result = await sendTemplateMessage('+919876543210', 'oa_exercise_reminder', 'en_US', [])

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid OAuth access token')
  })

  it('returns {success: false, error} on network error (no throw)', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789'

    MOCK_WHATSAPP_FETCH.mockRejectedValueOnce(new Error('fetch failed'))

    const { sendTemplateMessage } = await import('@/lib/whatsapp/client')

    const result = await sendTemplateMessage('+919876543210', 'oa_exercise_reminder', 'en_US', [])

    expect(result.success).toBe(false)
    expect(result.error).toContain('fetch failed')
  })
})

describe('getWhatsAppOptIns — scheduling/selection logic', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('only patients with whatsApp.enabled=true AND non-empty phone are selected', async () => {
    const { saveSettings, getWhatsAppOptIns } = await import('@/lib/store/settings')

    // Opt in p1 properly
    saveSettings('p1', { whatsApp: { enabled: true, phone: '+911111111111' } })
    // p2: empty phone — must not be selected
    saveSettings('p2', { whatsApp: { enabled: true, phone: '' } })
    // p3: enabled=false — must not be selected
    saveSettings('p3', { whatsApp: { enabled: false, phone: '+912222222222' } })

    const optIns = getWhatsAppOptIns()
    expect(optIns.map((s) => s.patientId)).toContain('p1')
    expect(optIns.map((s) => s.patientId)).not.toContain('p2')
    expect(optIns.map((s) => s.patientId)).not.toContain('p3')
  })
})

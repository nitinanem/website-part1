/**
 * Settings store — unit tests
 *
 * Tests: getSettings returns defaults, saveSettings merges correctly,
 * patientId cannot be overridden by client payload, getWhatsAppOptIns
 * selects only opted-in patients with non-empty phone.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { vi } from 'vitest'

async function getStore() {
  return import('@/lib/store/settings')
}

describe('lib/store/settings', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('getSettings("p1") returns default settings', async () => {
    const { getSettings } = await getStore()
    const settings = getSettings('p1')
    expect(settings.patientId).toBe('p1')
    expect(settings.language).toBe('en')
    expect(settings.whatsApp.enabled).toBe(false)
  })

  it('getSettings for unknown patient returns defaults with that patientId', async () => {
    const { getSettings } = await getStore()
    const settings = getSettings('p-unknown')
    expect(settings.patientId).toBe('p-unknown')
    expect(settings.language).toBe('en')
  })

  it('saveSettings merges partial update correctly', async () => {
    const { getSettings, saveSettings } = await getStore()
    saveSettings('p1', { language: 'hi', dailyReminders: false })
    const updated = getSettings('p1')
    expect(updated.language).toBe('hi')
    expect(updated.dailyReminders).toBe(false)
    // Non-patched fields stay unchanged
    expect(updated.weeklyEmail).toBe(false)
  })

  it('saveSettings does not allow patientId override via updates', async () => {
    const { getSettings, saveSettings } = await getStore()
    saveSettings('p1', { patientId: 'evil-id' } as never)
    const settings = getSettings('p1')
    // patientId is locked to the key, not the client value
    expect(settings.patientId).toBe('p1')
  })

  it('getWhatsAppOptIns returns empty array when no patients have opted in', async () => {
    const { getWhatsAppOptIns } = await getStore()
    const optIns = getWhatsAppOptIns()
    // Seed data has p1 with whatsApp.enabled=false
    expect(optIns).toHaveLength(0)
  })

  it('getWhatsAppOptIns returns opted-in patients with non-empty phone', async () => {
    const { getSettings, saveSettings, getWhatsAppOptIns } = await getStore()

    // Opt in p1
    saveSettings('p1', { whatsApp: { enabled: true, phone: '+919876543210' } })

    // Create and opt in a second patient
    saveSettings('p2', { whatsApp: { enabled: true, phone: '+919876543211' } })

    // p3 opted in but empty phone — must NOT appear
    saveSettings('p3', { whatsApp: { enabled: true, phone: '' } })

    // p4 has phone but not opted in — must NOT appear
    saveSettings('p4', { whatsApp: { enabled: false, phone: '+919876543212' } })

    const optIns = getWhatsAppOptIns()
    const phones = optIns.map((s) => s.whatsApp.phone)

    expect(phones).toContain('+919876543210')
    expect(phones).toContain('+919876543211')
    expect(phones).not.toContain('')
    expect(phones).not.toContain('+919876543212')
  })
})

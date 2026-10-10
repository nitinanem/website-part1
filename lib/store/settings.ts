/**
 * Shared in-memory settings store for Route Handlers.
 *
 * PLACEHOLDER (database): Replace with:
 *   GET  → SELECT * FROM user_settings WHERE patient_id = $1
 *   PUT  → INSERT INTO user_settings (...) VALUES (...) ON CONFLICT (patient_id) DO UPDATE SET ...
 */

import type { UserSettings } from '@/lib/types/assessment'

const defaultSettings: UserSettings = {
  patientId: 'p1',
  language: 'en',
  dailyReminders: true,
  weeklyEmail: false,
  whatsApp: { enabled: false, phone: '' },
}

const store = new Map<string, UserSettings>([['p1', { ...defaultSettings }]])

export function getSettings(patientId: string): UserSettings {
  return store.get(patientId) ?? { ...defaultSettings, patientId }
}

export function saveSettings(patientId: string, updates: Partial<UserSettings>): UserSettings {
  const current = store.get(patientId) ?? { ...defaultSettings, patientId }
  const merged: UserSettings = { ...current, ...updates, patientId }
  store.set(patientId, merged)
  return merged
}

/** Returns all patients with WhatsApp reminders enabled. Used by the reminder job. */
export function getWhatsAppOptIns(): UserSettings[] {
  return Array.from(store.values()).filter(
    (s) => s.whatsApp.enabled && s.whatsApp.phone.trim().length > 0,
  )
}

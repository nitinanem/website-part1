import type { UserSettings } from '@/lib/types/assessment'

// PLACEHOLDER: Replace with GET/PUT /api/settings/:patientId

const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms))

const defaultSettings: UserSettings = {
  patientId: 'p1',
  language: 'en',
  dailyReminders: true,
  weeklyEmail: false,
  whatsApp: {
    enabled: false,
    phone: '',
  },
}

// Local cache — mirrors what the server returns
const localCache: Record<string, UserSettings> = {
  p1: { ...defaultSettings },
}

async function fetchWithFallback<T>(
  url: string,
  options: RequestInit,
  fallback: () => T,
): Promise<T> {
  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    return fallback()
  }
}

export async function getSettings(patientId: string): Promise<UserSettings> {
  return fetchWithFallback(
    `/api/settings/${encodeURIComponent(patientId)}`,
    { method: 'GET' },
    () => localCache[patientId] ?? { ...defaultSettings, patientId },
  )
}

export async function saveSettings(
  patientId: string,
  updates: Partial<UserSettings>,
): Promise<UserSettings> {
  return fetchWithFallback(
    `/api/settings/${encodeURIComponent(patientId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    },
    () => {
      const current = localCache[patientId] ?? { ...defaultSettings, patientId }
      const merged = { ...current, ...updates, patientId }
      localCache[patientId] = merged
      return merged
    },
  )
}

void delay // preserve for future use

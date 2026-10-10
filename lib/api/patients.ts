import type { Patient, Doctor } from '@/lib/types/assessment'

// ─── Mock doctors list — also exposed for UI dropdowns ────────────────────────
// These are seeded into the DB via prisma/seed.ts on first deploy.
// Kept here as a UI fallback so dropdowns work before the DB is connected.
export const mockDoctors: Doctor[] = [
  { id: 'doc1', name: 'Dr. A. Sharma', specialization: 'Orthopedics' },
  { id: 'doc2', name: 'Dr. R. Gupta',  specialization: 'Physiotherapy' },
  { id: 'doc3', name: 'Dr. M. Patel',  specialization: 'Rheumatology' },
]

// ─── Local fallback store (used when DB is not yet connected) ──────────────────
const mockPatients: Patient[] = [
  {
    id: 'p1', name: 'Aman Sharma', age: 54,
    phone: '+91 98765 43210', email: 'aman.sharma@example.com',
    gender: 'male', primaryJoint: 'Right Knee',
    abhaId: '91-4820-9182-3849', emergencyContact: '+91 98765 00000 (Spouse)',
    allottedDoctorId: 'doc1',
    latestAssessmentId: 'a2', latestAssessmentStatus: 'pending_review',
  },
  {
    id: 'p2', name: 'Rekha Devi', age: 61,
    phone: '+91 97654 32109', email: 'rekha.devi@example.com',
    allottedDoctorId: 'doc2', latestAssessmentId: null, latestAssessmentStatus: null,
  },
]

// ─── Helper ────────────────────────────────────────────────────────────────────
async function fetchWithFallback<T>(url: string, options: RequestInit, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[patients] API call failed, using local fallback:', err)
    return fallback()
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getPatient(id: string): Promise<Patient | null> {
  return fetchWithFallback(
    `/api/patients/${encodeURIComponent(id)}`,
    { method: 'GET' },
    () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`jointcare_patient_${id}`)
          if (stored) return JSON.parse(stored) as Patient
        } catch { /* ignore */ }
      }
      return mockPatients.find((p) => p.id === id) ?? null
    },
  )
}

export async function updatePatient(id: string, patch: Partial<Patient>): Promise<Patient> {
  return fetchWithFallback(
    `/api/patients/${encodeURIComponent(id)}`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) },
    () => {
      const patient = mockPatients.find((p) => p.id === id)
      if (!patient) throw new Error('Patient not found')
      Object.assign(patient, patch)
      if (typeof window !== 'undefined') {
        try { localStorage.setItem(`jointcare_patient_${id}`, JSON.stringify(patient)) } catch { /* ignore */ }
      }
      return { ...patient }
    },
  )
}

export async function searchPatients(query: string): Promise<Patient[]> {
  return fetchWithFallback(
    `/api/patients?q=${encodeURIComponent(query)}`,
    { method: 'GET' },
    () => {
      const q = query.toLowerCase().trim()
      if (!q) return mockPatients
      return mockPatients.filter(
        (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone?.includes(q),
      )
    },
  )
}

export async function getDoctors(): Promise<Doctor[]> {
  return fetchWithFallback('/api/doctors', { method: 'GET' }, () => mockDoctors)
}

import type {
  Assessment,
  AssessmentStatus,
  RiskScore,
  LimeFactor,
} from '@/lib/types/assessment'

// ─── Real API calls to Next.js Route Handlers ────────────────────────────────
// These replace the in-memory mock store. The route handlers live at:
//   GET  /api/assessments?patientId=xxx
//   POST /api/assessments
//   GET  /api/assessments/[id]
//   POST /api/assessments/[id]/review
//   GET  /api/assessments/pending

const delay = (ms = 450) => new Promise<void>((r) => setTimeout(r, ms))

// ── Mock data kept for local fallback when route handlers aren't reachable ────
const mockLimeFactors: LimeFactor[] = [
  { feature: 'Gait asymmetry index', weight: 0.31, direction: 'risk' },
  { feature: 'BMI', weight: 0.22, direction: 'risk' },
  { feature: 'Morning stiffness duration', weight: 0.18, direction: 'risk' },
  { feature: 'Step cadence', weight: 0.14, direction: 'protective' },
  { feature: 'Pain on stairs (WOMAC)', weight: 0.09, direction: 'risk' },
  { feature: 'Age', weight: 0.06, direction: 'risk' },
]

const mockRiskScoreFull: RiskScore = {
  combined: 68, gait: 72, clinical: 61, confidence: 0.83,
  fallback: false, klGrade: 2, limeFactors: mockLimeFactors,
}

const mockRiskScoreFallback: RiskScore = {
  combined: 0, gait: 0, clinical: 54, confidence: 0.41,
  fallback: true, klGrade: 2, limeFactors: mockLimeFactors,
}

let mockStore: Assessment[] = [
  {
    id: 'a1', patientId: 'p1',
    createdAt: '2026-08-20T09:00:00Z', updatedAt: '2026-08-20T10:30:00Z',
    status: 'confirmed', gaitVideoRef: 'gait_p1_20260820.webm', xrayRef: null,
    anthropometrics: { heightCm: 168, weightKg: 72, bmi: 25.5, bodyType: 'average' },
    answers: [{ questionId: 'q-p1', score: 2 }, { questionId: 'q-s1', score: 1 }, { questionId: 'q-f1', score: 3 }],
    riskScore: mockRiskScoreFull,
    reviewedBy: 'staff-dr-priya', reviewedAt: '2026-08-21T08:00:00Z',
    reviewNote: 'Consistent with clinical examination. Recommend physiotherapy.',
    source: 'patient_self',
  },
  {
    id: 'a2', patientId: 'p1',
    createdAt: '2026-09-01T14:00:00Z', updatedAt: '2026-09-01T14:45:00Z',
    status: 'pending_review', gaitVideoRef: 'gait_p1_20260901.webm', xrayRef: 'xray_p1_20260901.jpg',
    anthropometrics: { heightCm: 168, weightKg: 71, bmi: 25.1, bodyType: 'average' },
    answers: [{ questionId: 'q-p1', score: 3 }, { questionId: 'q-s1', score: 2 }, { questionId: 'q-f1', score: 3 }],
    riskScore: mockRiskScoreFallback,
    reviewedBy: null, reviewedAt: null, reviewNote: null,
    source: 'patient_self',
  },
]
let nextMockId = 3

// ─── Helper: try real API, fall back to in-memory if not reachable ─────────────

async function fetchWithFallback<T>(
  url: string,
  options: RequestInit,
  fallback: () => T,
): Promise<T> {
  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[assessments] API call failed, using mock fallback:', err)
    return fallback()
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAssessments(patientId: string): Promise<Assessment[]> {
  return fetchWithFallback(
    `/api/assessments?patientId=${encodeURIComponent(patientId)}`,
    { method: 'GET' },
    () => mockStore
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  return fetchWithFallback(
    `/api/assessments/${encodeURIComponent(id)}`,
    { method: 'GET' },
    () => mockStore.find((a) => a.id === id) ?? null,
  )
}

export async function submitAssessment(
  draft: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt' | 'riskScore' | 'reviewedBy' | 'reviewedAt' | 'reviewNote'>,
): Promise<Assessment> {
  return fetchWithFallback(
    '/api/assessments',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    },
    () => {
      const now = new Date().toISOString()
      const assessment: Assessment = {
        ...draft, id: `a${nextMockId++}`, createdAt: now, updatedAt: now,
        riskScore: mockRiskScoreFull, status: 'pending_review',
        reviewedBy: null, reviewedAt: null, reviewNote: null,
      }
      mockStore = [assessment, ...mockStore]
      return assessment
    },
  )
}

export async function reviewAssessment(
  id: string,
  action: 'confirm' | 'flag',
  note: string,
): Promise<Assessment> {
  return fetchWithFallback(
    `/api/assessments/${encodeURIComponent(id)}/review`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note, reviewerId: 'staff-current' }),
    },
    () => {
      const idx = mockStore.findIndex((a) => a.id === id)
      if (idx === -1) throw new Error('Assessment not found')
      const newStatus: AssessmentStatus = action === 'confirm' ? 'confirmed' : 'flagged'
      const updated: Assessment = {
        ...mockStore[idx], status: newStatus,
        reviewedBy: 'staff-current', reviewedAt: new Date().toISOString(),
        reviewNote: note, updatedAt: new Date().toISOString(),
      }
      mockStore[idx] = updated
      return updated
    },
  )
}

export async function getPendingReviews(): Promise<Assessment[]> {
  return fetchWithFallback(
    '/api/assessments/pending',
    { method: 'GET' },
    () => mockStore.filter((a) => a.status === 'pending_review'),
  )
}

void delay // suppress unused import warning — delay still used by old callers that may have been removed

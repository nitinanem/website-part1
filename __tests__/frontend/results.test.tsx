/**
 * AssessmentResults — behavior tests
 *
 * Two distinct display states are tested:
 *   (A) Fused score  — riskScore.fallback = false  → shows combined/gait/clinical score grid
 *   (B) KL-grade fallback — riskScore.fallback = true → shows amber "Low-confidence" banner,
 *       NO score grid
 *
 * The test asserts on the rendered distinguishing element (text + badge class),
 * not on pixel values or animation timing.
 *
 * External calls mocked: getAssessmentById (lib/api/assessments)
 */

import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AssessmentResults } from '@/components/dashboard/assessment-results'
import type { Assessment } from '@/lib/types/assessment'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    circle: ({ children, ...props }: React.ComponentProps<'circle'>) => <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api/assessments', () => ({
  getAssessmentById: vi.fn(),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseAssessment: Assessment = {
  id: 'a1',
  patientId: 'p1',
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
  status: 'confirmed',
  gaitVideoRef: 'gait.webm',
  xrayRef: null,
  anthropometrics: { heightCm: 170, weightKg: 70, bmi: 24.2, bodyType: 'average' },
  answers: [],
  riskScore: null,
  reviewedBy: 'staff-dr-priya',
  reviewedAt: '2026-09-01T11:00:00Z',
  reviewNote: 'Looks good',
  source: 'patient_self',
}

const fusedAssessment: Assessment = {
  ...baseAssessment,
  riskScore: {
    combined: 68,
    gait: 72,
    clinical: 61,
    confidence: 0.83,
    fallback: false,
    klGrade: 2,
    limeFactors: [
      { feature: 'Gait asymmetry', weight: 0.31, direction: 'risk' },
    ],
  },
}

const fallbackAssessment: Assessment = {
  ...baseAssessment,
  status: 'pending_review',
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: null,
  riskScore: {
    combined: 0,
    gait: 0,
    clinical: 54,
    confidence: 0.38,
    fallback: true,
    klGrade: 2,
    limeFactors: [],
  },
}

// ─────────────────────────────────────────────────────────────────────────────

describe('AssessmentResults', () => {
  const onBack = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('(A) fused state: renders combined score grid', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(fusedAssessment)

    render(<AssessmentResults assessmentId="a1" onBack={onBack} />)

    await waitFor(() =>
      // Score is rendered as bare number (e.g. "68") with "/ 100" as a sibling text node
      expect(screen.getByText('68')).toBeInTheDocument()
    )

    // Sub-scores are also bare numbers
    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText('61')).toBeInTheDocument()

    // Fallback banner must NOT be present
    expect(screen.queryByText(/low-confidence/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/kl grade only/i)).not.toBeInTheDocument()
  })

  it('(B) KL-grade fallback state: renders amber "Low-confidence" label, not score grid', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(fallbackAssessment)

    render(<AssessmentResults assessmentId="a1" onBack={onBack} />)

    await waitFor(() =>
      // The specific text from the amber fallback banner in review-action and results
      expect(screen.getByText(/low-confidence/i)).toBeInTheDocument()
    )

    // Combined score must NOT be present (no fused score available)
    // The combined score is the numeric score; for fallback the combined = 0 but we don't show it
    // We check that the fused score section heading is absent
    expect(screen.queryByText('Combined Risk Score')).not.toBeInTheDocument()

    // The fallback banner is shown
    expect(screen.getByText(/low-confidence/i)).toBeInTheDocument()
    const klMatches = screen.getAllByText(/kl grade/i)
    expect(klMatches.length).toBeGreaterThan(0)
  })

  it('shows "Clinician Confirmed" badge for confirmed status', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(fusedAssessment)

    render(<AssessmentResults assessmentId="a1" onBack={onBack} />)

    await waitFor(() =>
      expect(screen.getByText(/clinician confirmed/i)).toBeInTheDocument()
    )
  })

  it('shows "Pending Clinician Review" badge for pending_review status', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(fallbackAssessment)

    render(<AssessmentResults assessmentId="a1" onBack={onBack} />)

    await waitFor(() =>
      expect(screen.getByText(/pending clinician review/i)).toBeInTheDocument()
    )
  })

  it('shows loading state initially (score content not yet rendered)', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockReturnValueOnce(new Promise(() => {})) // never resolves

    render(<AssessmentResults assessmentId="a1" onBack={onBack} />)

    // Score grid must not appear while loading
    expect(screen.queryByText(/\/100/)).not.toBeInTheDocument()
  })
})

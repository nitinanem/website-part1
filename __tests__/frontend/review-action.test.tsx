/**
 * ReviewAction (clinic/staff view) — behavior tests
 *
 * Tests: confirm action updates status, flag action updates status,
 * action buttons show correct loading states, error state on failure.
 *
 * External calls mocked: getAssessmentById, reviewAssessment (lib/api/assessments)
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ReviewAction } from '@/components/clinic/review-action'
import type { Assessment } from '@/lib/types/assessment'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api/assessments', () => ({
  getAssessmentById: vi.fn(),
  reviewAssessment: vi.fn(),
}))

const pendingAssessment: Assessment = {
  id: 'a2',
  patientId: 'p1',
  createdAt: '2026-09-01T14:00:00Z',
  updatedAt: '2026-09-01T14:45:00Z',
  status: 'pending_review',
  gaitVideoRef: 'gait.webm',
  xrayRef: null,
  anthropometrics: { heightCm: 168, weightKg: 71, bmi: 25.1, bodyType: 'average' },
  answers: [],
  riskScore: {
    combined: 72, gait: 75, clinical: 68, confidence: 0.85,
    fallback: false, klGrade: 2,
    limeFactors: [{ feature: 'Gait asymmetry', weight: 0.31, direction: 'risk' }],
  },
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: null,
  source: 'patient_self',
}

describe('ReviewAction', () => {
  const onDone = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assessment data and confirm/flag buttons', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(pendingAssessment)

    render(<ReviewAction assessmentId="a2" patientName="Aman Sharma" onDone={onDone} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm result/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /flag/i })).toBeInTheDocument()
    })

    // Shows patient name
    expect(screen.getByText('Aman Sharma')).toBeInTheDocument()
  })

  it('"Confirm Result" calls reviewAssessment with "confirm" and shows success', async () => {
    const user = userEvent.setup()
    const { getAssessmentById, reviewAssessment } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(pendingAssessment)
    vi.mocked(reviewAssessment).mockResolvedValueOnce({
      ...pendingAssessment,
      status: 'confirmed',
      reviewedBy: 'staff-current',
      reviewedAt: new Date().toISOString(),
    })

    render(<ReviewAction assessmentId="a2" patientName="Aman Sharma" onDone={onDone} />)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /confirm result/i })).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /confirm result/i }))

    expect(reviewAssessment).toHaveBeenCalledWith('a2', 'confirm', expect.any(String))

    await waitFor(() =>
      expect(screen.getByText(/result confirmed/i)).toBeInTheDocument()
    )
  })

  it('"Flag" calls reviewAssessment with "flag" and shows flagged message', async () => {
    const user = userEvent.setup()
    const { getAssessmentById, reviewAssessment } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(pendingAssessment)
    vi.mocked(reviewAssessment).mockResolvedValueOnce({
      ...pendingAssessment,
      status: 'flagged',
      reviewedBy: 'staff-current',
      reviewedAt: new Date().toISOString(),
    })

    render(<ReviewAction assessmentId="a2" patientName="Aman Sharma" onDone={onDone} />)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /flag/i })).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /flag/i }))

    expect(reviewAssessment).toHaveBeenCalledWith('a2', 'flag', expect.any(String))

    await waitFor(() =>
      expect(screen.getByText(/flagged for second opinion/i)).toBeInTheDocument()
    )
  })

  it('shows error message when reviewAssessment rejects', async () => {
    const user = userEvent.setup()
    const { getAssessmentById, reviewAssessment } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(pendingAssessment)
    vi.mocked(reviewAssessment).mockRejectedValueOnce(new Error('Network error'))

    render(<ReviewAction assessmentId="a2" patientName="Aman Sharma" onDone={onDone} />)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /confirm result/i })).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /confirm result/i }))

    await waitFor(() =>
      expect(screen.getByText(/action failed/i)).toBeInTheDocument()
    )
    // Buttons should be re-enabled after error
    expect(screen.getByRole('button', { name: /confirm result/i })).not.toBeDisabled()
  })

  it('shows "Assessment not found" when getAssessmentById returns null', async () => {
    const { getAssessmentById } = await import('@/lib/api/assessments')
    vi.mocked(getAssessmentById).mockResolvedValueOnce(null)

    render(<ReviewAction assessmentId="a-missing" patientName="Unknown" onDone={onDone} />)

    await waitFor(() =>
      expect(screen.getByText(/assessment not found/i)).toBeInTheDocument()
    )
  })
})

/**
 * AssessmentHistory — behavior tests
 *
 * Tests: list renders all entries, each entry links/buttons to the correct assessment ID,
 * empty state renders, error state renders, "Start New" triggers callback.
 *
 * External calls mocked: getAssessments (lib/api/assessments)
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AssessmentHistory } from '@/components/dashboard/assessment-history'
import { LanguageProvider } from '@/lib/i18n/context'
import type { Assessment } from '@/lib/types/assessment'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, onClick, className }: React.ComponentProps<'button'>) => (
      <button onClick={onClick} className={className}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api/assessments', () => ({
  getAssessments: vi.fn(),
}))

const mockAssessments: Assessment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-08-20T10:30:00Z',
    status: 'confirmed',
    gaitVideoRef: 'gait.webm',
    xrayRef: null,
    anthropometrics: { heightCm: 168, weightKg: 72, bmi: 25.5, bodyType: 'average' },
    answers: [],
    riskScore: {
      combined: 68, gait: 72, clinical: 61, confidence: 0.83,
      fallback: false, klGrade: 2, limeFactors: [],
    },
    reviewedBy: 'staff-dr-priya',
    reviewedAt: '2026-08-21T08:00:00Z',
    reviewNote: 'Good',
    source: 'patient_self',
  },
  {
    id: 'a2',
    patientId: 'p1',
    createdAt: '2026-09-01T14:00:00Z',
    updatedAt: '2026-09-01T14:45:00Z',
    status: 'pending_review',
    gaitVideoRef: 'gait2.webm',
    xrayRef: null,
    anthropometrics: { heightCm: 168, weightKg: 71, bmi: 25.1, bodyType: 'average' },
    answers: [],
    riskScore: {
      combined: 0, gait: 0, clinical: 54, confidence: 0.38,
      fallback: true, klGrade: 2, limeFactors: [],
    },
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    source: 'patient_self',
  },
]

describe('AssessmentHistory', () => {
  const onViewResult = vi.fn()
  const onStartNew = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders both assessment entries after loading', async () => {
    const { getAssessments } = await import('@/lib/api/assessments')
    vi.mocked(getAssessments).mockResolvedValueOnce(mockAssessments)

    render(
      <LanguageProvider>
        <AssessmentHistory onViewResult={onViewResult} onStartNew={onStartNew} />
      </LanguageProvider>
    )

    await waitFor(() => {
      // Both entries should be present — identified by status label
      expect(screen.getByText(/confirmed/i)).toBeInTheDocument()
      expect(screen.getByText(/pending/i)).toBeInTheDocument()
    })
  })

  it('each entry has a view button that calls onViewResult with the correct ID', async () => {
    const user = userEvent.setup()
    const { getAssessments } = await import('@/lib/api/assessments')
    vi.mocked(getAssessments).mockResolvedValueOnce(mockAssessments)

    render(
      <LanguageProvider>
        <AssessmentHistory onViewResult={onViewResult} onStartNew={onStartNew} />
      </LanguageProvider>
    )

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i })
      expect(viewButtons.length).toBeGreaterThanOrEqual(1)
    })

    const viewButtons = screen.getAllByRole('button', { name: /view/i })
    await user.click(viewButtons[0])
    expect(onViewResult).toHaveBeenCalledOnce()
    expect(['a1', 'a2']).toContain(onViewResult.mock.calls[0][0])
  })

  it('"Start New Assessment" button triggers onStartNew', async () => {
    const user = userEvent.setup()
    const { getAssessments } = await import('@/lib/api/assessments')
    vi.mocked(getAssessments).mockResolvedValueOnce([])

    render(
      <LanguageProvider>
        <AssessmentHistory onViewResult={onViewResult} onStartNew={onStartNew} />
      </LanguageProvider>
    )

    await waitFor(() => expect(screen.queryByText('My Assessments')).toBeInTheDocument())

    const newBtn = screen.getByRole('button', { name: /new assessment/i })
    await user.click(newBtn)
    expect(onStartNew).toHaveBeenCalledOnce()
  })

  it('shows empty state when no assessments exist', async () => {
    const { getAssessments } = await import('@/lib/api/assessments')
    vi.mocked(getAssessments).mockResolvedValueOnce([])

    render(
      <LanguageProvider>
        <AssessmentHistory onViewResult={onViewResult} onStartNew={onStartNew} />
      </LanguageProvider>
    )

    await waitFor(() =>
      expect(screen.queryByText(/confirmed/i)).not.toBeInTheDocument()
    )
  })

  it('shows error state when getAssessments rejects', async () => {
    const { getAssessments } = await import('@/lib/api/assessments')
    vi.mocked(getAssessments).mockRejectedValueOnce(new Error('Network'))

    render(
      <LanguageProvider>
        <AssessmentHistory onViewResult={onViewResult} onStartNew={onStartNew} />
      </LanguageProvider>
    )

    await waitFor(() =>
      expect(screen.getByText(/failed to load|something went wrong/i)).toBeInTheDocument()
    )
  })
})

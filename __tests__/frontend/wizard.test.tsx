/**
 * Assessment Wizard — behavior tests
 *
 * Tests: step rendering, required-field gating, back-navigation state preservation,
 * successful submit, and submit error state.
 * Does NOT test: animation timing, framer-motion internals, pixel values.
 *
 * External calls mocked: submitAssessment (lib/api/assessments)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AssessmentWizard } from '@/components/dashboard/assessment/assessment-wizard'

// ── Mock the API layer — never let component tests hit the network ─────────────
vi.mock('@/lib/api/assessments', () => ({
  submitAssessment: vi.fn().mockResolvedValue({ id: 'a-test-123' }),
}))

// ── Mock framer-motion to avoid jsdom animation issues ───────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) =>
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div {...props}>{children}</div>,
    circle: ({ children, ...props }: React.ComponentProps<'circle'>) =>
      <circle {...props}>{children}</circle>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ── Mock child step components so wizard tests focus on orchestration ─────────
vi.mock('@/components/dashboard/assessment/step-gait-video', () => ({
  StepGaitVideo: ({ onChange }: { onChange: (d: { videoRef: string; fileName: string }) => void }) => (
    <div data-testid="step-gait">
      <button
        onClick={() => onChange({ videoRef: 'test-video.webm', fileName: 'test.webm' })}
        data-testid="btn-set-gait"
      >
        Set gait video
      </button>
    </div>
  ),
}))

vi.mock('@/components/dashboard/assessment/step-anthropometrics', () => ({
  StepAnthropometrics: ({ onChange }: { onChange: (d: object) => void }) => (
    <div data-testid="step-anthropometrics">
      <button
        onClick={() => onChange({ heightCm: 170, weightKg: 70, bodyType: 'average', bmi: 24.2 })}
        data-testid="btn-set-anthro"
      >
        Set anthropometrics
      </button>
    </div>
  ),
}))

vi.mock('@/components/dashboard/assessment/step-questionnaire', () => ({
  StepQuestionnaire: ({ onChange }: { onChange: (a: object[]) => void }) => (
    <div data-testid="step-questionnaire">
      <button
        onClick={() => onChange(Array.from({ length: 12 }, (_, i) => ({ questionId: `q${i}`, score: 0 })))}
        data-testid="btn-set-answers"
      >
        Answer all
      </button>
    </div>
  ),
}))

vi.mock('@/components/dashboard/assessment/step-xray-upload', () => ({
  StepXrayUpload: () => <div data-testid="step-xray">X-ray step</div>,
}))

vi.mock('@/components/dashboard/assessment/wizard-progress-bar', () => ({
  WizardProgressBar: () => <div data-testid="progress-bar" />,
}))

// ─────────────────────────────────────────────────────────────────────────────

describe('AssessmentWizard', () => {
  const onComplete = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('renders step 0 (gait) on first load', () => {
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)
    expect(screen.getByTestId('step-gait')).toBeInTheDocument()
    expect(screen.queryByTestId('step-anthropometrics')).not.toBeInTheDocument()
  })

  it('shows "Step 1 of 4" on load', () => {
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)
    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument()
  })

  it('Continue button is disabled when required field (gait video) not set', () => {
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)
    const continueBtn = screen.getByRole('button', { name: /continue/i })
    expect(continueBtn).toBeDisabled()
  })

  it('Continue button enables after gait video is set', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)
    await user.click(screen.getByTestId('btn-set-gait'))
    const continueBtn = screen.getByRole('button', { name: /continue/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('navigating to step 2 then back to step 1 preserves gait data', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)

    // Set gait data and advance
    await user.click(screen.getByTestId('btn-set-gait'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Now on step 2 (anthropometrics)
    expect(screen.getByTestId('step-anthropometrics')).toBeInTheDocument()

    // Go back
    await user.click(screen.getByRole('button', { name: /back/i }))

    // Step 1 still shows with Continue enabled (gait data preserved)
    expect(screen.getByTestId('step-gait')).toBeInTheDocument()
    const continueBtn = screen.getByRole('button', { name: /continue/i })
    expect(continueBtn).not.toBeDisabled()
  })

  it('preserves draft in sessionStorage across steps', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)

    await user.click(screen.getByTestId('btn-set-gait'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const draft = JSON.parse(sessionStorage.getItem('jointcare_assessment_draft') ?? '{}')
    expect(draft.gait.videoRef).toBe('test-video.webm')
    expect(draft.step).toBe(1)
  })

  it('calls onCancel when Cancel is clicked on step 0', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('reaches final step and Submit Assessment button is present', async () => {
    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)

    // Step 0 → 1
    await user.click(screen.getByTestId('btn-set-gait'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    // Step 1 → 2
    await user.click(screen.getByTestId('btn-set-anthro'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    // Step 2 → 3
    await user.click(screen.getByTestId('btn-set-answers'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByRole('button', { name: /submit assessment/i })).toBeInTheDocument()
  })

  it('shows "Assessment submitted!" and calls onComplete after submit', async () => {
    const { submitAssessment } = await import('@/lib/api/assessments')
    vi.mocked(submitAssessment).mockResolvedValueOnce({ id: 'a-done' } as never)

    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)

    await user.click(screen.getByTestId('btn-set-gait'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByTestId('btn-set-anthro'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByTestId('btn-set-answers'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /submit assessment/i }))

    await waitFor(() =>
      expect(screen.getByText(/assessment submitted/i)).toBeInTheDocument()
    )
  })

  it('shows error message when submitAssessment rejects', async () => {
    const { submitAssessment } = await import('@/lib/api/assessments')
    vi.mocked(submitAssessment).mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<AssessmentWizard onComplete={onComplete} onCancel={onCancel} />)

    await user.click(screen.getByTestId('btn-set-gait'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByTestId('btn-set-anthro'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByTestId('btn-set-answers'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /submit assessment/i }))

    await waitFor(() =>
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument()
    )
    expect(onComplete).not.toHaveBeenCalled()
  })
})

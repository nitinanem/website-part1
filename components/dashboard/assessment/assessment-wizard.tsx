'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import { WizardProgressBar } from './wizard-progress-bar'
import { StepGaitVideo, type GaitVideoStepData } from './step-gait-video'
import { StepAnthropometrics } from './step-anthropometrics'
import { StepQuestionnaire } from './step-questionnaire'
import { StepXrayUpload, type XrayStepData } from './step-xray-upload'
import { submitAssessment } from '@/lib/api/assessments'
import type { Anthropometrics, WomacKoosAnswer } from '@/lib/types/assessment'

const DRAFT_KEY = 'jointcare_assessment_draft' // sessionStorage key

interface WizardState {
  step: number
  gait: GaitVideoStepData
  anthropometrics: Partial<Anthropometrics>
  answers: WomacKoosAnswer[]
  xray: XrayStepData
}

const defaultState: WizardState = {
  step: 0,
  gait: { videoRef: null, fileName: null },
  anthropometrics: {},
  answers: [],
  xray: { xrayRef: null, fileName: null },
}

interface Props {
  onComplete: (assessmentId: string) => void
  onCancel: () => void
}

function loadDraft(): WizardState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw) as WizardState
  } catch { /* ignore */ }
  return defaultState
}

function saveDraft(state: WizardState) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

function clearDraft() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(DRAFT_KEY)
}

export function AssessmentWizard({ onComplete, onCancel }: Props) {
  const [state, _setState] = useState<WizardState>(loadDraft)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)

  function setState(next: WizardState) {
    _setState(next)
    saveDraft(next)
  }

  const totalSteps = 4
  const { step } = state

  // Which steps count as "completed" (used by progress bar)
  const completed = [
    !!state.gait.videoRef,
    !!(state.anthropometrics.heightCm && state.anthropometrics.weightKg && state.anthropometrics.bodyType),
    state.answers.length === 12, // all 12 questions answered
    true, // X-ray is optional — always "completable"
  ]

  function canProceed() {
    if (step === 0) return !!state.gait.videoRef
    if (step === 1)
      return !!(
        state.anthropometrics.heightCm &&
        state.anthropometrics.weightKg &&
        state.anthropometrics.bodyType
      )
    if (step === 2) return state.answers.length >= 12
    return true // step 3 (X-ray) is optional
  }

  function go(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1)
    setState({ ...state, step: nextStep })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await submitAssessment({
        patientId: 'p1', // PLACEHOLDER — from real auth session
        status: 'submitted',
        gaitVideoRef: state.gait.videoRef,
        xrayRef: state.xray.xrayRef,
        anthropometrics: state.anthropometrics.heightCm
          ? {
              heightCm: state.anthropometrics.heightCm!,
              weightKg: state.anthropometrics.weightKg!,
              bmi: state.anthropometrics.bmi ?? 0, // PLACEHOLDER — backend recomputes
              bodyType: state.anthropometrics.bodyType!,
            }
          : null,
        answers: state.answers,
        source: 'patient_self',
      })
      clearDraft()
      setDone(true)
      setTimeout(() => onComplete(result.id), 1800)
    } catch (e) {
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-20 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="size-9" />
        </span>
        <h2 className="font-serif text-2xl font-bold">Assessment submitted!</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your data is being processed. You&#39;ll see your results shortly.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">OA Risk Assessment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {step + 1} of {totalSteps} · Your progress is saved automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-8">
        <WizardProgressBar current={step} completed={completed} />

        <div className="mt-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              {step === 0 && (
                <StepGaitVideo
                  data={state.gait}
                  onChange={(gait) => setState({ ...state, gait })}
                />
              )}
              {step === 1 && (
                <StepAnthropometrics
                  data={state.anthropometrics}
                  onChange={(anthropometrics) => setState({ ...state, anthropometrics })}
                />
              )}
              {step === 2 && (
                <StepQuestionnaire
                  answers={state.answers}
                  onChange={(answers) => setState({ ...state, answers })}
                />
              )}
              {step === 3 && (
                <StepXrayUpload
                  data={state.xray}
                  onChange={(xray) => setState({ ...state, xray })}
                  onSkip={() => go(3)} // stays on step 3, just marks xray skipped
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {submitError && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {submitError}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={step === 0 ? onCancel : () => go(step - 1)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < totalSteps - 1 ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => go(step + 1)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Continue <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> Submit Assessment
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

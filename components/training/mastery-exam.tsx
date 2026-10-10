'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lock,
  Eye,
  Check,
  X,
  User,
  GraduationCap,
  Loader2,
} from 'lucide-react'
import { EXAM_QUESTION_BANK, type ExamQuestion } from '@/lib/training/exam-questions'
import {
  issueVerifiableCertificate,
  type CredentialCertificate,
} from '@/lib/training/blockchain-ledger'
import type { EngagementMilestones } from '@/lib/training/use-engagement-tracker'
import { CredentialCertificateCard } from './credential-certificate'

interface Props {
  condition: 'oa' | 'osteoporosis'
  topicId: string
  topicTitle: string
  milestones: EngagementMilestones
  onClose?: () => void
}

const QUESTION_TIME_SECONDS = 45
const PASSING_PERCENT = 80 // 4 out of 5 required

export function MasteryExamModal({
  condition,
  topicId,
  topicTitle,
  milestones,
  onClose,
}: Props) {
  const [examStarted, setExamStarted] = useState(false)
  const [examCompleted, setExamCompleted] = useState(false)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [examFlagged, setExamFlagged] = useState(false)
  const [candidateName, setCandidateName] = useState('')
  const [issuedCertificate, setIssuedCertificate] = useState<CredentialCertificate | null>(null)
  const [isIssuing, setIsIssuing] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionStartTimeRef = useRef<number>(Date.now())
  const questionTimesRef = useRef<number[]>([])

  // Initialize randomized questions pool
  const initializeQuestions = useCallback(() => {
    const matching = EXAM_QUESTION_BANK.filter((q) => q.condition === condition)
    // Shuffle and pick 5
    const shuffled = [...matching].sort(() => Math.random() - 0.5).slice(0, 5)
    setQuestions(shuffled)
    setCurrentQIndex(0)
    setSelectedAnswers({})
    setTimeLeft(QUESTION_TIME_SECONDS)
    setTabSwitches(0)
    setShowTabWarning(false)
    setExamFlagged(false)
    setExamCompleted(false)
    setIssuedCertificate(null)
    questionTimesRef.current = []
    questionStartTimeRef.current = Date.now()
  }, [condition])

  // Anti-Cheat Tab & Blur Proctor Listener
  useEffect(() => {
    if (!examStarted || examCompleted || examFlagged) return

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const nextCount = prev + 1
          if (nextCount > 2) {
            setExamFlagged(true)
          } else {
            setShowTabWarning(true)
          }
          return nextCount
        })
      }
    }

    const handleBlur = () => {
      setTabSwitches((prev) => {
        const nextCount = prev + 1
        if (nextCount > 2) {
          setExamFlagged(true)
        } else {
          setShowTabWarning(true)
        }
        return nextCount
      })
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
    }
  }, [examStarted, examCompleted, examFlagged])

  // Live Question Countdown Timer
  useEffect(() => {
    if (!examStarted || examCompleted || examFlagged) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question, auto advance
          handleNextQuestion()
          return QUESTION_TIME_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examStarted, examCompleted, examFlagged, currentQIndex, questions.length])

  // Cooldown countdown if exam failed
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const cdInterval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(cdInterval)
  }, [cooldownSeconds])

  function handleStartExam() {
    initializeQuestions()
    setExamStarted(true)
  }

  function handleSelectOption(optIndex: number) {
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: optIndex }))
  }

  function handleNextQuestion() {
    // Record elapsed time on this question
    const elapsed = (Date.now() - questionStartTimeRef.current) / 1000
    questionTimesRef.current.push(elapsed)
    questionStartTimeRef.current = Date.now()

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((idx) => idx + 1)
      setTimeLeft(QUESTION_TIME_SECONDS)
    } else {
      // Exam finished
      setExamCompleted(true)
      const correctCount = calculateCorrectCount()
      const score = Math.round((correctCount / questions.length) * 100)
      if (score < PASSING_PERCENT) {
        setCooldownSeconds(45)
      }
    }
  }

  function calculateCorrectCount(): number {
    let count = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        count++
      }
    })
    return count
  }

  async function handleIssueCertificate() {
    if (!candidateName.trim()) return
    setIsIssuing(true)

    const correctCount = calculateCorrectCount()
    const scorePercent = Math.round((correctCount / questions.length) * 100)
    const avgSec =
      questionTimesRef.current.reduce((a, b) => a + b, 0) / (questionTimesRef.current.length || 1)

    try {
      const cert = await issueVerifiableCertificate({
        recipientName: candidateName.trim(),
        condition,
        topicId,
        topicTitle,
        scorePercent,
        totalQuestions: questions.length,
        correctCount,
        activeStudyTimeSeconds: milestones.activeSeconds,
        checkpointsCleared: milestones.visualsZoomedCount + milestones.sectionsViewedCount,
        tabSwitches,
        averageSecondsPerQuestion: avgSec,
      })
      setIssuedCertificate(cert)
    } catch (err) {
      console.error('Failed to issue certificate:', err)
    } finally {
      setIsIssuing(false)
    }
  }

  const currentQ = questions[currentQIndex]
  const isAnswerSelected = selectedAnswers[currentQIndex] !== undefined
  const correctCount = calculateCorrectCount()
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const isPassed = scorePercent >= PASSING_PERCENT

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl my-8 rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 rounded-xl border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        )}

        {/* ── CASE 1: Certificate Already Issued ───────────────────────────── */}
        {issuedCertificate ? (
          <CredentialCertificateCard certificate={issuedCertificate} onClose={onClose} />
        ) : /* ── CASE 2: Anti-Cheat Tab Violation Flagged ───────────────────── */
        examFlagged ? (
          <div className="text-center py-8 space-y-4">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/30">
              <ShieldAlert className="size-8" />
            </span>
            <h3 className="font-serif text-2xl font-bold text-destructive">
              Exam Flagged for Proctor Violation
            </h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Multiple browser tab switches were detected ({tabSwitches} times). Navigating away from the exam or consulting external AI tools is prohibited.
            </p>
            <button
              type="button"
              onClick={handleStartExam}
              className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Restart Proctored Exam
            </button>
          </div>
        ) : /* ── CASE 3: Eligibility Criteria Not Yet Met (Anti-Skip Gate) ──── */
        !milestones.isEligible && !examStarted ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Lock className="size-6" />
              </span>
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Accreditation Eligibility Gate
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
                  Active Study Milestones Required
                </h3>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              To preserve authentic clinical credential integrity and prevent automated scrolling or AI chatbot exploitation, you must actively study this module before taking the proctored exam.
            </p>

            {/* Real-time Checklist */}
            <div className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-5 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {milestones.activeSeconds >= milestones.requiredSeconds ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <Clock className="size-4 text-amber-600 animate-spin" />
                  )}
                  <span>Active Reading Presence:</span>
                </div>
                <span className="font-mono text-xs font-bold">
                  {milestones.activeSeconds}s / {milestones.requiredSeconds}s required
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {milestones.visualsZoomedCount >= milestones.requiredVisuals ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <Eye className="size-4 text-muted-foreground" />
                  )}
                  <span>Inspect & Zoom Clinical Visuals:</span>
                </div>
                <span className="font-mono text-xs font-bold">
                  {milestones.visualsZoomedCount} / {milestones.requiredVisuals} inspected
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {milestones.sectionsViewedCount >= milestones.requiredSections ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <CheckCircle2 className="size-4 text-muted-foreground opacity-40" />
                  )}
                  <span>Review Clinical Sections:</span>
                </div>
                <span className="font-mono text-xs font-bold">
                  {milestones.sectionsViewedCount} / {milestones.requiredSections} sections
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-muted-foreground">
                <span>Eligibility Progress</span>
                <span>{milestones.progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${milestones.progressPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary cursor-pointer"
              >
                Return to Reading & Visuals
              </button>
              <span className="text-xs text-muted-foreground italic">
                Scroll the module and zoom any figure to unlock immediately.
              </span>
            </div>
          </div>
        ) : /* ── CASE 4: Initial Pre-Exam Instructions ──────────────────────── */
        !examStarted ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="size-6" />
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Eligibility Verified &bull; Proctored Exam Ready
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
                  {condition === 'oa'
                    ? 'Osteoarthritis Clinical Mastery Examination'
                    : 'Osteoporosis Pathophysiology & DEXA Examination'}
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm space-y-3">
              <p className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Anti-AI & Proctoring Rules:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-foreground/80 list-disc list-inside">
                <li>
                  <strong>45 Seconds Per Question:</strong> Fast response timer prevents feeding prompts to AI chatbots.
                </li>
                <li>
                  <strong>Anti-Tab Switch Monitor:</strong> Navigating away from this tab will trigger an instant proctor warning. More than 2 tab switches invalidates the attempt.
                </li>
                <li>
                  <strong>80% Honors Passing Threshold:</strong> You must score 4 out of 5 questions correctly to unlock the on-chain certificate.
                </li>
                <li>
                  <strong>Cryptographic Merkle Proof:</strong> Successful credentials receive an immutable Block Hash and verification QR code.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExam}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 cursor-pointer"
              >
                <span>Start Proctored Exam</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ) : /* ── CASE 5: Exam Completed (Results / Pass / Fail) ──────────────── */
        examCompleted ? (
          <div className="space-y-6 text-center py-4">
            <span
              className={`mx-auto flex size-16 items-center justify-center rounded-2xl border ${
                isPassed
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}
            >
              {isPassed ? <Award className="size-8" /> : <RotateCcw className="size-8" />}
            </span>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Proctored Exam Result
              </span>
              <h3 className="font-serif text-2xl font-black text-foreground sm:text-3xl mt-1">
                {isPassed ? 'Congratulations! You Passed' : 'Minimum 80% Passing Score Not Reached'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You scored <strong className="text-foreground">{correctCount} of {questions.length} ({scorePercent}%)</strong>.
              </p>
            </div>

            {isPassed ? (
              <div className="mx-auto max-w-md rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-left space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Full Name for Official Certificate:
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma or Anita Paul"
                      className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    This name will be cryptographically hashed and sealed onto the blockchain ledger.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!candidateName.trim() || isIssuing}
                  onClick={handleIssueCertificate}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {isIssuing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Minting Cryptographic Credential...</span>
                    </>
                  ) : (
                    <>
                      <Award className="size-4" />
                      <span>Issue & View Blockchain Certificate</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-950 dark:text-amber-200">
                  <p className="font-bold">Clinical Areas for Review:</p>
                  <p className="mt-1 leading-relaxed">
                    Review the clinical sections and visual diagrams above to strengthen understanding before re-attempting.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={cooldownSeconds > 0}
                  onClick={handleStartExam}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {cooldownSeconds > 0
                    ? `Retake Available in ${cooldownSeconds}s`
                    : 'Retake Proctored Exam (Fresh Questions)'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── CASE 6: Active Proctored Examination ──────────────────────────── */
          <div className="space-y-6 select-none" onCopy={(e) => e.preventDefault()}>
            {/* Proctor Status Bar */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
                  Proctor Active
                </span>
                {tabSwitches > 0 && (
                  <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    Warnings: {tabSwitches}/2
                  </span>
                )}
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-xs font-bold ${
                  timeLeft <= 10
                    ? 'border-destructive bg-destructive/10 text-destructive animate-pulse'
                    : 'border-border bg-secondary text-foreground'
                }`}
              >
                <Clock className="size-3.5" />
                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Tab Warning Toast */}
            {showTabWarning && (
              <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>
                    <strong>Warning:</strong> Tab switch detected! Consulting external tabs or AI chatbots is prohibited ({tabSwitches}/2).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTabWarning(false)}
                  className="font-bold underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Question Vignette Card */}
            {currentQ && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px]">
                    {currentQ.clinicalDomain}
                  </span>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5 text-sm leading-relaxed text-foreground">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-1">
                    Clinical Case Vignette:
                  </span>
                  <p>{currentQ.vignette}</p>
                </div>

                <h4 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  {currentQ.question}
                </h4>

                <div className="space-y-2.5 pt-1">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === optIdx
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-xs sm:text-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20 shadow-xs'
                            : 'border-border bg-card hover:bg-secondary/70 hover:border-border/80'
                        }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground italic">
                Choose the best clinical response. Auto-advances when timer expires.
              </span>
              <button
                type="button"
                disabled={!isAnswerSelected}
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
              >
                <span>{currentQIndex === questions.length - 1 ? 'Submit Exam' : 'Next Question'}</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  PlusCircle,
  ChevronRight,
  Loader2,
  AlertTriangle,
  InboxIcon,
  CheckCircle2,
  Flag,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { getAssessments } from '@/lib/api/assessments'
import type { Assessment } from '@/lib/types/assessment'
import { useTranslation } from '@/lib/i18n/context'

interface Props {
  onViewResult: (id: string) => void
  onStartNew: () => void
}

export function AssessmentHistory({ onViewResult, onStartNew }: Props) {
  const { t } = useTranslation()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Status config — labels pulled from the i18n results section so they translate too
  const statusConfig = {
    draft:          { label: t.results.statusBadges.draft,          Icon: Clock,         cls: 'text-muted-foreground bg-secondary' },
    submitted:      { label: t.results.statusBadges.submitted,      Icon: Loader2,       cls: 'text-chart-2 bg-chart-2/10' },
    pending_review: { label: t.results.statusBadges.pending_review, Icon: AlertCircle,   cls: 'text-chart-4 bg-chart-4/10' },
    confirmed:      { label: t.results.statusBadges.confirmed,      Icon: CheckCircle2,  cls: 'text-primary bg-primary/10' },
    flagged:        { label: t.results.statusBadges.flagged,        Icon: Flag,          cls: 'text-destructive bg-destructive/10' },
  }

  useEffect(() => {
    let cancelled = false
    getAssessments('p1') // PLACEHOLDER — real patientId from auth
      .then((list) => { if (!cancelled) { setAssessments(list); setLoading(false) } })
      .catch(() => { if (!cancelled) { setError(t.common.error); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">{t.assessmentHistory.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.assessmentHistory.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onStartNew}
          className="flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          {t.assessmentHistory.newAssessment}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
          <AlertTriangle className="size-7 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && assessments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardCheck className="size-8" />
          </span>
          <div className="text-center max-w-lg">
            <p className="font-serif text-2xl font-semibold">{t.assessmentHistory.noAssessmentsYet}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.assessmentHistory.noAssessmentsDesc}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="font-semibold text-sm flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">1</span>
                Gait Video Analysis
              </span>
              <p className="text-xs text-muted-foreground">Upload a short walking video for AI-powered biomechanical analysis.</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="font-semibold text-sm flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">2</span>
                Anthropometrics
              </span>
              <p className="text-xs text-muted-foreground">Provide basic measurements like height and weight to calculate BMI.</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="font-semibold text-sm flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">3</span>
                Clinical Questionnaire
              </span>
              <p className="text-xs text-muted-foreground">Answer standard WOMAC/KOOS questions about your joint pain and stiffness.</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-secondary/50 border border-border">
              <span className="font-semibold text-sm flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">4</span>
                X-Ray Upload (Optional)
              </span>
              <p className="text-xs text-muted-foreground">Upload X-ray images for precise Kellgren-Lawrence (KL) grading.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartNew}
            className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <PlusCircle className="size-4" /> {t.assessmentHistory.startAssessment}
          </button>
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && assessments.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {assessments.map((a, i) => {
              const cfg = statusConfig[a.status]
              const Icon = cfg.Icon
              const score = a.riskScore
              const scoreDisplay = score
                ? score.fallback
                  ? `KL ${score.klGrade} only`
                  : `${score.combined}/100`
                : t.common.processing

              return (
                <motion.button
                  key={a.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  onClick={() => onViewResult(a.id)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                    <ClipboardCheck className="size-5" />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-semibold">
                        {new Date(a.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t.assessmentHistory.riskScore}: <strong className="text-foreground">{scoreDisplay}</strong>
                      {a.riskScore?.fallback && (
                        <span className="ml-2 text-[11px] text-chart-4">({t.assessmentHistory.lowConfidence})</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.source === 'clinic_admin' ? '🏥 ' + t.assessmentHistory.clinicAdministered : '📱 ' + t.assessmentHistory.selfService}
                    </p>
                  </div>

                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

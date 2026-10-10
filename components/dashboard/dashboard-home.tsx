'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, Flame, NotebookPen, Activity, ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/session-provider'
import type { DashboardPage } from '@/components/dashboard/dashboard'
import { getAssessments } from '@/lib/api/assessments'
import { getJournalEntries } from '@/lib/api/journal'
import type { Assessment, JournalEntry } from '@/lib/types/assessment'
import { useTranslation } from '@/lib/i18n/context'

interface Props {
  onGo: (p: DashboardPage) => void
  onStartAssessment: () => void
  onViewAssessments: () => void
}

export function DashboardHome({ onGo, onStartAssessment, onViewAssessments }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const patientId = user?.uid || 'p1'
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(true)

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [exerciseCount, setExerciseCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    getAssessments(patientId)
      .then((list) => { if (!cancelled) { setLatestAssessment(list[0] ?? null); setLoadingAssessment(false) } })
      .catch(() => { if (!cancelled) setLoadingAssessment(false) })

    getJournalEntries(patientId)
      .then((entries) => { if (!cancelled) setJournalEntries(entries) })
      .catch(() => {})

    if (typeof window !== 'undefined' && patientId) {
      const saved = localStorage.getItem(`jointcare_exercises_${patientId}`)
      if (saved) {
        try {
          const set = new Set(JSON.parse(saved))
          setExerciseCount(set.size)
        } catch {}
      }
    }

    return () => { cancelled = true }
  }, [patientId])

  const avgPain = journalEntries.length > 0
    ? (journalEntries.reduce((sum, e) => sum + Number(e.painLevel), 0) / journalEntries.length).toFixed(1)
    : '--'

  const avgPainHint = journalEntries.length > 0
    ? t.dashHome.avgPainHint
    : 'No entries yet'

  const streak = journalEntries.length > 0 ? `${journalEntries.length} Days` : '0 Days'
  const streakHint = journalEntries.length > 0 ? `${journalEntries.length} logged entries` : 'Log pain to start streak'

  const stats = [
    { label: t.dashHome.avgPainLabel, value: avgPain, hint: avgPainHint, icon: TrendingDown },
    { label: t.dashHome.streakLabel, value: streak, hint: streakHint, icon: Flame },
    { label: t.dashHome.exercisesLabel, value: `${exerciseCount} / 5`, hint: t.dashHome.exercisesHint, icon: Activity },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-2xl border border-border bg-primary p-6 text-primary-foreground md:p-8"
      >
        <p className="text-sm font-medium text-primary-foreground/80">{t.dashHome.greetingPrefix}</p>
        <h1 className="mt-1 font-serif text-2xl font-bold md:text-3xl">{user?.displayName || 'Patient'}</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-primary-foreground/85">
          {t.dashHome.motivationText}
        </p>
        <button
          type="button"
          onClick={() => onGo('journal')}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
        >
          <NotebookPen className="size-4" aria-hidden="true" />
          {t.dashHome.logPainCta}
        </button>
      </motion.div>



      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * (i + 2) }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                <stat.icon className="size-4.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickCard
          title={t.dashHome.progressQuickTitle}
          body={t.dashHome.progressQuickDesc}
          onClick={() => onGo('progress')}
        />
        <QuickCard
          title={t.dashHome.assistantQuickTitle}
          body={t.dashHome.assistantQuickDesc}
          onClick={() => onGo('assistant')}
        />
      </div>

      {/* Query Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-destructive/5 via-transparent to-transparent" />
        <div className="relative p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="font-serif text-xl font-bold tracking-tight">{t.contact.patientTitle}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t.contact.patientSubtitle}
            </p>
          </div>
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('query') as HTMLInputElement;
              if (input.value.trim()) {
                alert(t.contact.patientSuccessAlert);
                form.reset();
              }
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input 
              type="text" 
              name="query"
              placeholder={t.contact.patientMessagePlaceholder}
              className="flex-1 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none backdrop-blur transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/30"
              required
            />
            <button 
              type="submit" 
              className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-destructive px-6 py-3 text-sm font-semibold text-destructive-foreground shadow-md shadow-destructive/20 transition-all hover:bg-destructive/90 hover:shadow-destructive/30 active:scale-[0.98]"
            >
              {t.contact.patientSendBtn}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

function QuickCard({ title, body, onClick }: { title: string; body: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:bg-secondary/50"
    >
      <span>
        <span className="font-serif text-lg font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{body}</span>
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </button>
  )
}

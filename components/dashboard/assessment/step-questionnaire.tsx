'use client'

import { motion } from 'framer-motion'
import { womacQuestions } from '@/lib/data'
import type { WomacKoosAnswer } from '@/lib/types/assessment'

interface Props {
  answers: WomacKoosAnswer[]
  onChange: (answers: WomacKoosAnswer[]) => void
}

const subscaleLabels = {
  pain: 'Pain',
  stiffness: 'Stiffness',
  function: 'Physical Function',
}

const scoreLabels = ['None', 'Mild', 'Moderate', 'Severe', 'Extreme']
const scoreColors = [
  'text-primary',
  'text-chart-3',
  'text-chart-4',
  'text-chart-5',
  'text-destructive',
]

export function StepQuestionnaire({ answers, onChange }: Props) {
  function setAnswer(questionId: string, score: number) {
    const existing = answers.findIndex((a) => a.questionId === questionId)
    if (existing >= 0) {
      const next = [...answers]
      next[existing] = { questionId, score }
      onChange(next)
    } else {
      onChange([...answers, { questionId, score }])
    }
  }

  function getScore(questionId: string): number | undefined {
    return answers.find((a) => a.questionId === questionId)?.score
  }

  const subscales = ['pain', 'stiffness', 'function'] as const

  const totalAnswered = answers.length
  const totalQuestions = womacQuestions.length
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold">Joint Health Questionnaire</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          WOMAC/KOOS-style assessment. Rate each item on a 0–4 scale.{' '}
          {/* PLACEHOLDER: question set pending clinical validation */}
        </p>
      </div>

      {/* Overall progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{totalAnswered} of {totalQuestions} answered</span>
          <span className="font-medium">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Questions by subscale */}
      <div className="space-y-8">
        {subscales.map((subscale) => {
          const qs = womacQuestions.filter((q) => q.subscale === subscale)
          const done = qs.filter((q) => getScore(q.id) !== undefined).length
          return (
            <section key={subscale}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">
                  {subscaleLabels[subscale]}
                </h3>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                  {done}/{qs.length}
                </span>
              </div>

              <div className="space-y-5">
                {qs.map((q) => {
                  const score = getScore(q.id)
                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-5 transition-colors ${
                        score !== undefined ? 'border-primary/30 bg-accent/20' : 'border-border bg-card'
                      }`}
                    >
                      <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {scoreLabels.map((label, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAnswer(q.id, i)}
                            className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-center transition-all ${
                              score === i
                                ? 'border-primary bg-primary text-primary-foreground shadow-sm scale-105'
                                : 'border-border hover:border-primary/40 hover:bg-accent/30'
                            }`}
                          >
                            <span className={`font-bold text-base ${score === i ? 'text-primary-foreground' : scoreColors[i]}`}>
                              {i}
                            </span>
                            <span className={`text-[10px] leading-tight ${score === i ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

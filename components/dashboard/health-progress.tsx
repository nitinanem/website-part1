'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Check, TrendingDown, TrendingUp, Activity, Dumbbell, Download, FileText, CalendarDays, Loader2, NotebookPen, Sparkles } from 'lucide-react'
import { painTrendData, monthlyTrendData } from '@/lib/data'
import { useTranslation } from '@/lib/i18n/context'
import { useAuth } from '@/components/session-provider'
import { getJournalEntries } from '@/lib/api/journal'
import type { JournalEntry } from '@/lib/types/assessment'
import ReactMarkdown from 'react-markdown'

interface Props {
  onGoToJournal?: () => void
}

export function HealthProgress({ onGoToJournal }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const patientId = user?.patientId || user?.uid || 'p1'

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set())
  const [insights, setInsights] = useState<string | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(true)

  // Load patient's persistent exercise checklist from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && patientId) {
      const saved = localStorage.getItem(`jointcare_exercises_${patientId}`)
      if (saved) {
        try {
          setDoneSet(new Set(JSON.parse(saved)))
        } catch {
          setDoneSet(new Set())
        }
      } else {
        // Start empty for new accounts
        setDoneSet(new Set())
      }
    }
  }, [patientId])

  // Load real journal entries from PostgreSQL
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getJournalEntries(patientId)
      .then((data) => {
        if (!cancelled) {
          setEntries(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.warn('Failed to load journal entries for progress:', err)
        if (!cancelled) setLoading(false)
      })

    // Fetch Gemini AI Insights
    setLoadingInsights(true)
    fetch(`/api/insights?patientId=${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.insights) {
          setInsights(data.insights)
          setLoadingInsights(false)
        } else {
          setLoadingInsights(false)
        }
      })
      .catch((err) => {
        console.warn('Failed to load AI insights:', err)
        if (!cancelled) setLoadingInsights(false)
      })

    return () => {
      cancelled = true
    }
  }, [patientId])

  const exercises = t.progress.exercises
  const doneCount = doneSet.size
  const percent = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0

  function toggle(idx: number) {
    setDoneSet((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      if (typeof window !== 'undefined' && patientId) {
        localStorage.setItem(`jointcare_exercises_${patientId}`, JSON.stringify(Array.from(next)))
      }
      return next
    })
  }

  // Format real entries chronologically (oldest to newest)
  const sortedEntries = [...entries].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || new Date((a as any).createdAt || 0).getTime()
    const timeB = new Date(b.date).getTime() || new Date((b as any).createdAt || 0).getTime()
    return timeA - timeB
  })

  // Format chart data from real entries (last 7 entries)
  const chartData = sortedEntries.slice(-7).map((e, idx) => {
    let label = e.date
    if (/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
      const d = new Date(e.date + 'T00:00:00')
      label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })
    }
    return {
      day: label || `Entry ${idx + 1}`,
      fullDate: e.date,
      pain: Number(e.painLevel),
      location: e.location,
      notes: e.notes,
    }
  })

  // Determine real trend
  let trendBadge = {
    label: t.progress.improvingBadge || 'Improving',
    icon: TrendingDown,
    color: 'text-emerald-600 bg-accent',
  }

  if (chartData.length >= 2) {
    const firstPain = chartData[0].pain
    const lastPain = chartData[chartData.length - 1].pain
    if (lastPain < firstPain) {
      trendBadge = {
        label: t.progress.improvingBadge || 'Improving',
        icon: TrendingDown,
        color: 'text-emerald-600 bg-accent',
      }
    } else if (lastPain > firstPain) {
      trendBadge = {
        label: 'Attention Needed',
        icon: TrendingUp,
        color: 'text-amber-600 bg-amber-500/10',
      }
    } else {
      trendBadge = {
        label: 'Stable',
        icon: Activity,
        color: 'text-primary bg-primary/10',
      }
    }
  } else if (chartData.length === 1) {
    trendBadge = {
      label: 'Baseline Recorded',
      icon: Activity,
      color: 'text-primary bg-primary/10',
    }
  }

  const [isGenerating, setIsGenerating] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function generatePDF(type: 'weekly' | 'monthly') {
    if (isGenerating) return
    setIsGenerating(true)
    setDropdownOpen(false)

    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const margin = 15
      const contentW = pageW - margin * 2
      const teal: [number, number, number] = [15, 118, 110]
      const gray: [number, number, number] = [107, 114, 128]
      const dark: [number, number, number] = [17, 24, 39]
      const light: [number, number, number] = [243, 244, 246]
      const white: [number, number, number] = [255, 255, 255]
      const green: [number, number, number] = [34, 197, 94]

      let y = margin

      // ── Header ──────────────────────────────────────────────────
      pdf.setFillColor(...teal)
      pdf.rect(0, 0, pageW, 28, 'F')
      pdf.setTextColor(...white)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Swastik', margin, 12)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text(
        `${type === 'weekly' ? 'Weekly' : 'Monthly'} Health Progress Report - ${user?.displayName || user?.name || 'Patient'}`,
        margin,
        20
      )
      pdf.setFontSize(9)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageW - margin, 20, { align: 'right' })

      y = 36

      // ── Summary Stats ────────────────────────────────────────────
      const boxW = (contentW - 8) / 3
      const stats = [
        { label: 'Exercise Completion', value: `${percent}%` },
        { label: 'Exercises Done', value: `${doneCount} / ${exercises.length}` },
        { label: 'Trend', value: trendBadge.label },
      ]
      stats.forEach((s, i) => {
        const bx = margin + i * (boxW + 4)
        pdf.setFillColor(...light)
        pdf.roundedRect(bx, y, boxW, 20, 2, 2, 'F')
        pdf.setTextColor(...teal)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(s.value, bx + boxW / 2, y + 12, { align: 'center' })
        pdf.setTextColor(...gray)
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'normal')
        pdf.text(s.label, bx + boxW / 2, y + 18, { align: 'center' })
      })

      y += 28

      // ── Pain Chart / Data ────────────────────────────────────────
      const dataToPrint =
        chartData.length > 0
          ? chartData
          : type === 'weekly'
          ? painTrendData
          : monthlyTrendData.slice(0, 14)

      const chartH = 50
      const chartY = y + 12
      const maxPain = 10
      const dataPointW = contentW / (dataToPrint.length || 1)

      pdf.setTextColor(...dark)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text(
        type === 'weekly' ? 'Pain Level - Recent Entries' : 'Pain Level - Longitudinal History',
        margin,
        y
      )
      pdf.setFontSize(8)
      pdf.setTextColor(...gray)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Lower is better (scale 0-10)', margin + 80, y)

      // Grid lines
      for (let g = 0; g <= 5; g++) {
        const gy = chartY + (g / 5) * chartH
        pdf.setDrawColor(229, 231, 235)
        pdf.setLineWidth(0.2)
        pdf.line(margin, gy, margin + contentW, gy)
        pdf.setTextColor(...gray)
        pdf.setFontSize(6)
        pdf.text(String(10 - g * 2), margin - 3, gy + 1, { align: 'right' })
      }

      // Plot line
      if (dataToPrint.length > 0) {
        pdf.setDrawColor(...teal)
        pdf.setLineWidth(0.8)
        const pts = dataToPrint.map((d: any, i: number) => ({
          x: margin + i * dataPointW + dataPointW / 2,
          y: chartY + ((maxPain - d.pain) / maxPain) * chartH,
        }))
        for (let i = 1; i < pts.length; i++) {
          pdf.line(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y)
        }

        // Dots + day labels
        pts.forEach((p: any, i: number) => {
          pdf.setFillColor(...teal)
          pdf.circle(p.x, p.y, type === 'weekly' ? 1.2 : 0.6, 'F')
          if (type === 'weekly' || i % 5 === 0) {
            pdf.setTextColor(...gray)
            pdf.setFontSize(6)
            pdf.text(dataToPrint[i].day, p.x, chartY + chartH + 5, { align: 'center' })
          }
        })
      }

      y = chartY + chartH + 14

      // ── Exercise Checklist ───────────────────────────────────────
      pdf.setTextColor(...dark)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text("Exercise Plan - Today's Progress", margin, y)

      // Progress bar
      y += 5
      pdf.setFillColor(...light)
      pdf.roundedRect(margin, y, contentW, 5, 2, 2, 'F')
      pdf.setFillColor(...teal)
      pdf.roundedRect(margin, y, contentW * (percent / 100), 5, 2, 2, 'F')
      pdf.setTextColor(...teal)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${percent}% complete`, margin + contentW, y + 4, { align: 'right' })

      y += 10

      // Exercises list
      exercises.forEach((label, idx) => {
        const done = doneSet.has(idx)
        const rowY = y + idx * 10

        if (done) {
          pdf.setFillColor(...teal)
          pdf.roundedRect(margin, rowY - 3.5, 5, 5, 1, 1, 'F')
          pdf.setTextColor(...white)
          pdf.setFontSize(8)
          pdf.text('v', margin + 1.2, rowY)
        } else {
          pdf.setDrawColor(209, 213, 219)
          pdf.setLineWidth(0.4)
          pdf.roundedRect(margin, rowY - 3.5, 5, 5, 1, 1, 'S')
        }

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...(done ? gray : dark))
        pdf.text(label, margin + 8, rowY)
      })

      pdf.save(`swastik-progress-report-${type}-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('Failed to generate progress report PDF:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">{t.progress.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.progress.subtitle}</p>
        </div>

        {/* Download PDF button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:opacity-50 /* theme-regression-ok */"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {isGenerating ? t.progress.generatingReport : t.progress.downloadReport}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
              <button
                type="button"
                onClick={() => generatePDF('weekly')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <CalendarDays className="size-4 text-muted-foreground" />
                {t.progress.weeklyReport}
              </button>
              <button
                type="button"
                onClick={() => generatePDF('monthly')}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <FileText className="size-4 text-muted-foreground" />
                {t.progress.monthlyReport}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold">{t.progress.chartTitle}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {chartData.length > 0 ? t.progress.chartHint : 'Live data from your Pain Journal'}
              </p>
            </div>
            {chartData.length > 0 && (
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${trendBadge.color}`}>
                <trendBadge.icon className="size-3.5" aria-hidden="true" />
                {trendBadge.label}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="mt-6 flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays className="size-6" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">No Pain Records Yet</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  This account has not recorded any entries yet. Once you log your joint sensation in the Pain Health Journal, your real progress and trends will be graphed here.
                </p>
              </div>
              {onGoToJournal && (
                <button
                  type="button"
                  onClick={onGoToJournal}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  <NotebookPen className="size-3.5" />
                  Record First Pain Entry
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      fontSize: 12,
                      color: 'var(--foreground)',
                    }}
                    labelStyle={{ color: 'var(--muted-foreground)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pain"
                    name="Pain Level"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Exercise consistency */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-2xl border border-border bg-card p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Dumbbell className="size-4.5" aria-hidden="true" />
            </span>
            <h2 className="font-serif text-lg font-semibold">{t.progress.exerciseTitle}</h2>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.progress.todaysPlan}</span>
              <span className="font-semibold text-foreground">{percent}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <ul className="mt-5 space-y-2">
            {exercises.map((label, idx) => {
              const done = doneSet.has(idx)
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        done ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                      }`}
                    >
                      {done && <Check className="size-3.5" aria-hidden="true" />}
                    </span>
                    <span className={`text-sm ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>

      {/* AI Personalized Health Insights */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="size-24 text-primary" />
        </div>
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-sm">
            <Sparkles className="size-4.5 animate-pulse" />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">AI Health Insights</h2>
            <p className="text-xs text-muted-foreground">Personalized analysis by Gemini</p>
          </div>
        </div>

        <div className="relative z-10 text-sm leading-relaxed text-foreground/90">
          {loadingInsights ? (
            <div className="flex items-center gap-3 py-6 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span>Analyzing your journal patterns...</span>
            </div>
          ) : insights ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          ) : (
            <p className="py-4 text-muted-foreground italic">No insights available at this time. Keep logging your entries to unlock AI analysis!</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

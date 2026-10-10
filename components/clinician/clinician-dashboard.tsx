'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

// ── Types ──────────────────────────────────────────────────────────────────────
interface PatientSummary {
  id: string
  name: string
  age?: number
  gender?: string
  email?: string
  primary_joint?: string
  assessment_status: string
  latest_risk_score?: {
    oa_risk_score?: number
    kam_estimate?: number
    risk_label?: string
    confidence?: number
  }
  latest_assessment_date?: string
  avg_pain_7d?: number
  trend: 'low' | 'moderate' | 'high' | 'unknown'
}

interface DashboardData {
  clinician_id: string
  total_patients: number
  pending_reviews: number
  flagged_cases: number
  patients: PatientSummary[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function riskColor(label?: string) {
  if (label === 'high')     return 'text-red-500'
  if (label === 'moderate') return 'text-amber-500'
  if (label === 'low')      return 'text-emerald-500'
  return 'text-muted-foreground'
}

function riskBg(label?: string) {
  if (label === 'high')     return 'bg-red-500/10 border-red-500/20'
  if (label === 'moderate') return 'bg-amber-500/10 border-amber-500/20'
  if (label === 'low')      return 'bg-emerald-500/10 border-emerald-500/20'
  return 'bg-secondary border-border'
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'high')
    return <TrendingUp className="size-4 text-red-500" />
  if (trend === 'moderate')
    return <Minus className="size-4 text-amber-500" />
  return <TrendingDown className="size-4 text-emerald-500" />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_review: { label: 'Pending Review', cls: 'bg-amber-500/15 text-amber-600' },
    flagged:        { label: 'Flagged',         cls: 'bg-red-500/15 text-red-600'    },
    confirmed:      { label: 'Confirmed',        cls: 'bg-emerald-500/15 text-emerald-600' },
    submitted:      { label: 'Submitted',        cls: 'bg-blue-500/15 text-blue-600' },
    draft:          { label: 'Draft',            cls: 'bg-secondary text-muted-foreground' },
    no_assessment:  { label: 'No Assessment',    cls: 'bg-secondary text-muted-foreground' },
  }
  const info = map[status] ?? map['no_assessment']
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${info.cls}`}>
      {info.label}
    </span>
  )
}

// ── Dashboard Component ────────────────────────────────────────────────────────
export default function ClinicianDashboard({ clinicianId }: { clinicianId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<PatientSummary | null>(null)

  const fetch_data = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clinician/dashboard/${clinicianId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: DashboardData = await res.json()
      setData(json)
      if (json.patients.length > 0 && !selected) {
        setSelected(json.patients[0])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch_data() }, [clinicianId])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <RefreshCw className="mr-2 size-5 animate-spin" />
        Loading dashboard…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        <AlertTriangle className="mx-auto mb-2 size-8" />
        <p className="font-medium">Could not load dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={fetch_data}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      label: 'Total Patients',
      value: data.total_patients,
      icon: <Users className="size-5 text-primary" />,
      bg: 'bg-primary/10',
    },
    {
      label: 'Pending Reviews',
      value: data.pending_reviews,
      icon: <Clock className="size-5 text-amber-500" />,
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Flagged Cases',
      value: data.flagged_cases,
      icon: <AlertTriangle className="size-5 text-red-500" />,
      bg: 'bg-red-500/10',
    },
    {
      label: 'AI Analysed',
      value: data.patients.filter(p => p.latest_risk_score).length,
      icon: <Activity className="size-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinician Dashboard</h2>
          <p className="text-sm text-muted-foreground">AI-Fused OA Risk Evidence</p>
        </div>
        <button
          onClick={fetch_data}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${s.bg}`}>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Patient List + Detail ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Patient table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="border-b border-border bg-secondary/30 px-5 py-3">
            <h3 className="font-semibold text-sm">Patient List</h3>
          </div>
          <div className="divide-y divide-border">
            {data.patients.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No patients assigned yet.
              </p>
            ) : (
              data.patients.map(p => {
                const riskLabel = p.latest_risk_score?.risk_label
                const riskScore = p.latest_risk_score?.oa_risk_score
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full px-5 py-4 text-left transition-colors hover:bg-secondary/40 ${
                      selected?.id === p.id ? 'bg-secondary/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.age ? `${p.age} yrs` : '—'} · {p.gender ?? '—'} · {p.primary_joint ?? 'Joint N/A'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={p.assessment_status} />
                        {riskScore !== undefined && (
                          <span className={`text-xs font-semibold ${riskColor(riskLabel)}`}>
                            OA {(riskScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selected.age ? `${selected.age} yrs` : '—'} · {selected.gender ?? '—'}
                  </p>
                </div>
                <TrendIcon trend={selected.trend} />
              </div>

              {selected.latest_risk_score ? (
                <div className="space-y-3">
                  {/* OA Risk Score bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">OA Risk Score</span>
                      <span className={`font-bold ${riskColor(selected.latest_risk_score.risk_label)}`}>
                        {selected.latest_risk_score.risk_label?.toUpperCase()} (
                        {((selected.latest_risk_score.oa_risk_score ?? 0) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selected.latest_risk_score.risk_label === 'high'
                            ? 'bg-red-500'
                            : selected.latest_risk_score.risk_label === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(selected.latest_risk_score.oa_risk_score ?? 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* KAM Estimate */}
                  <div className={`rounded-lg border p-3 ${riskBg(selected.latest_risk_score.risk_label)}`}>
                    <p className="text-xs text-muted-foreground">KAM Estimate</p>
                    <p className={`text-xl font-bold ${riskColor(selected.latest_risk_score.risk_label)}`}>
                      {selected.latest_risk_score.kam_estimate?.toFixed(3)} Nm/kg
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Healthy range: 0.25 – 0.50 Nm/kg
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Model Confidence</span>
                    <span className="font-medium">
                      {((selected.latest_risk_score.confidence ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
                  <BarChart3 className="mx-auto mb-2 size-8 opacity-40" />
                  No AI analysis yet.
                  <br />Ask the patient to upload a gait video.
                </div>
              )}
            </div>

            {/* 7-day pain score */}
            {selected.avg_pain_7d !== undefined && selected.avg_pain_7d !== null && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <p className="mb-1 text-xs text-muted-foreground">7-Day Avg Pain Score</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold">{selected.avg_pain_7d}</p>
                  <p className="mb-1 text-sm text-muted-foreground">/ 10</p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(selected.avg_pain_7d / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Last assessment date */}
            {selected.latest_assessment_date && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm shadow-xs">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span className="text-muted-foreground">Last assessed</span>
                <span className="ml-auto font-medium">
                  {new Date(selected.latest_assessment_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

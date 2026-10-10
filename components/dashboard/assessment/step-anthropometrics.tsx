'use client'

import { useEffect, useState } from 'react'
import type { Anthropometrics, BodyType } from '@/lib/types/assessment'

export type { Anthropometrics }

interface Props {
  data: Partial<Anthropometrics>
  onChange: (d: Partial<Anthropometrics>) => void
}

const bodyTypes: { value: BodyType; label: string; desc: string }[] = [
  { value: 'slim', label: 'Slim', desc: 'Below average body weight' },
  { value: 'average', label: 'Average', desc: 'Healthy weight range' },
  { value: 'athletic', label: 'Athletic', desc: 'Muscular build' },
  { value: 'overweight', label: 'Overweight', desc: 'Above healthy weight range' },
]

function computeBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}

function bmiCategory(bmi: number) {
  if (bmi === 0) return null
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-chart-2' }
  if (bmi < 25) return { label: 'Normal', color: 'text-primary' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-chart-4' }
  return { label: 'Obese', color: 'text-destructive' }
}

export function StepAnthropometrics({ data, onChange }: Props) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weightLbs, setWeightLbs] = useState('')

  // Keep displayed BMI in sync
  const bmi = computeBMI(data.heightCm ?? 0, data.weightKg ?? 0)
  const cat = bmiCategory(bmi)

  function handleHeightMetric(v: string) {
    const num = parseFloat(v)
    onChange({ ...data, heightCm: isNaN(num) ? undefined : num })
  }

  function handleWeightMetric(v: string) {
    const num = parseFloat(v)
    onChange({ ...data, weightKg: isNaN(num) ? undefined : num })
  }

  function handleImperialHeight() {
    const ft = parseFloat(heightFt) || 0
    const inNum = parseFloat(heightIn) || 0
    const cm = Math.round((ft * 30.48) + (inNum * 2.54))
    onChange({ ...data, heightCm: cm || undefined })
  }

  function handleImperialWeight(v: string) {
    const lbs = parseFloat(v)
    const kg = isNaN(lbs) ? undefined : Math.round(lbs * 0.453592 * 10) / 10
    setWeightLbs(v)
    onChange({ ...data, weightKg: kg })
  }

  useEffect(() => {
    if (unit === 'imperial') {
      handleImperialHeight()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightFt, heightIn])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold">Body Measurements</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your height and weight help calibrate the risk model.
        </p>
      </div>

      {/* Unit toggle */}
      <div className="flex w-fit rounded-xl border border-border bg-secondary/60 p-1">
        {(['metric', 'imperial'] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              unit === u ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {u === 'metric' ? 'cm / kg' : 'ft·in / lbs'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Height */}
        {unit === 'metric' ? (
          <Field label="Height (cm)">
            <input
              type="number"
              min={100}
              max={250}
              value={data.heightCm ?? ''}
              onChange={(e) => handleHeightMetric(e.target.value)}
              placeholder="e.g. 168"
              className="input-base"
            />
          </Field>
        ) : (
          <Field label="Height (ft / in)">
            <div className="flex gap-2">
              <input
                type="number"
                min={3}
                max={8}
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                placeholder="ft"
                className="input-base w-20"
              />
              <input
                type="number"
                min={0}
                max={11}
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                placeholder="in"
                className="input-base w-20"
              />
            </div>
          </Field>
        )}

        {/* Weight */}
        {unit === 'metric' ? (
          <Field label="Weight (kg)">
            <input
              type="number"
              min={30}
              max={250}
              value={data.weightKg ?? ''}
              onChange={(e) => handleWeightMetric(e.target.value)}
              placeholder="e.g. 72"
              className="input-base"
            />
          </Field>
        ) : (
          <Field label="Weight (lbs)">
            <input
              type="number"
              min={66}
              max={550}
              value={weightLbs}
              onChange={(e) => handleImperialWeight(e.target.value)}
              placeholder="e.g. 158"
              className="input-base"
            />
          </Field>
        )}
      </div>

      {/* BMI display — PLACEHOLDER: backend recomputes this */}
      {bmi > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4">
          <div>
            <p className="text-xs text-muted-foreground">BMI (indicative) // PLACEHOLDER</p>
            <p className={`font-serif text-2xl font-bold ${cat?.color}`}>
              {bmi}{' '}
              <span className="text-sm font-normal">{cat?.label}</span>
            </p>
          </div>
        </div>
      )}

      {/* Body type */}
      <div>
        <p className="mb-3 text-sm font-medium">Body type</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {bodyTypes.map((bt) => (
            <button
              key={bt.value}
              type="button"
              onClick={() => onChange({ ...data, bodyType: bt.value })}
              className={`rounded-xl border p-3 text-left transition-colors ${
                data.bodyType === bt.value
                  ? 'border-primary bg-accent/40 text-primary'
                  : 'border-border hover:bg-secondary/60'
              }`}
            >
              <p className="text-sm font-semibold">{bt.label}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{bt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

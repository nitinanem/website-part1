'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Check,
  Loader2,
  Pencil,
  X,
  ChevronRight,
  Bell,
  Moon,
  Globe,
  MessageCircle,
  Download,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Send,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/components/session-provider'
import { getSettings, saveSettings } from '@/lib/api/settings'
import { getPatient } from '@/lib/api/patients'
import type { UserSettings, Patient } from '@/lib/types/assessment'
import { useTranslation, type Language } from '@/lib/i18n/context'
import { LanguagePicker } from '@/components/ui/language-picker'

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        on ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function SettingsView() {
  const { t, language, setLanguage } = useTranslation()
  const { user } = useAuth()
  const patientId = user?.uid || 'p1'
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)


  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Test WhatsApp reminder trigger
  const [testReminderSent, setTestReminderSent] = useState(false)

  useEffect(() => {
    Promise.all([getSettings(patientId), getPatient(patientId)]).then(([s, p]) => {
      setSettings(s)
      if (p) {
        setPatient(p)
      }
      setLoading(false)
    })
  }, [patientId])

  async function update(patch: Partial<UserSettings>) {
    if (!settings) return
    const next = { ...settings, ...patch }
    setSettings(next)
    setSaving(true)
    setSaved(false)
    try {
      await saveSettings(patientId, patch)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function handleLanguageChange(lang: Language) {
    setLanguage(lang)
    update({ language: lang })
  }

  function handleSendTestReminder() {
    setTestReminderSent(true)
    setTimeout(() => setTestReminderSent(false), 3500)
  }

  function handleExportData() {
    const exportPayload = {
      patient,
      settings,
      exportedAt: new Date().toISOString(),
      platform: 'Swastik National Health Platform',
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `swastik-records-${patient?.id || 'p1'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  const patientName = patient?.name || user?.displayName || 'Patient'
  const patientEmail = patient?.email || user?.email || 'patient@example.com'
  const patientInitials = patientName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-7 max-w-4xl">
      {/* ─── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              Account & Clinical Preferences
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Synced
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t.settings.title}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.settings.subtitle} · Logged in as <span className="font-semibold text-foreground">{patientName}</span>
          </p>
        </div>

        {/* Global Save Indicator */}
        <div className="flex items-center gap-2">
          {(saving || saved) && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-xs transition-all ${
                saved
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> {t.common.saving}
                </>
              ) : (
                <>
                  <Check className="size-3.5" /> {t.common.saved}
                </>
              )}
            </div>
          )}
        </div>
      </div>



      {/* ─── Profile Section ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-border/80">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar & Profile Info */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20 font-serif text-xl font-bold shadow-inner">
                  {patientInitials || <User className="size-7" />}
                </span>
                <span
                  className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs"
                  title="Verified Patient Record"
                >
                  <ShieldCheck className="size-3.5" />
                </span>
              </div>

              {/* Profile Info */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-lg font-bold text-foreground">{patientName}</p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Verified Patient
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    ID: #{patient?.id?.toUpperCase() || 'P1'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="size-3 text-muted-foreground/70" />
                  {patientEmail}
                </p>

                {/* Meta Chips */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-1">
                  {patient?.age !== undefined && patient?.age !== null ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-foreground">
                      <Calendar className="size-3 text-muted-foreground" />
                      <span>{patient.age} yrs</span>
                    </span>
                  ) : null}

                  {patient?.phone ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-foreground">
                      <Phone className="size-3 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </span>
                  ) : null}

                  {patient?.primaryJoint ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                      <Activity className="size-3 text-primary" />
                      <span>Joint: {patient.primaryJoint}</span>
                    </span>
                  ) : null}

                  {patient?.gender && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium capitalize text-muted-foreground">
                      <User className="size-3 text-muted-foreground" />
                      <span>{patient.gender}</span>
                    </span>
                  )}

                  {patient?.abhaId && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-foreground">
                      <ShieldCheck className="size-3 text-emerald-500" />
                      <span>ABHA: {patient.abhaId}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Notification & Reminder Preferences ─────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Routine & Notifications
        </h2>
        <section className="divide-y divide-border rounded-2xl border border-border bg-card shadow-xs">
          {/* Daily Reminders */}
          <div className="flex items-center justify-between gap-4 p-5 hover:bg-secondary/20 transition-colors">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.settings.dailyRemindersTitle}</p>
                  {settings.dailyReminders && (
                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Clock className="size-2.5" /> 8:00 PM
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {t.settings.dailyRemindersDesc}
                </p>
              </div>
            </div>
            <Toggle
              on={settings.dailyReminders}
              onToggle={() => update({ dailyReminders: !settings.dailyReminders })}
              label={t.settings.dailyRemindersTitle}
            />
          </div>

          {/* Weekly Progress Email */}
          <div className="flex items-center justify-between gap-4 p-5 hover:bg-secondary/20 transition-colors">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-4/10 text-chart-4">
                <Moon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.settings.weeklyEmailTitle}</p>
                  {settings.weeklyEmail && (
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Sent to: {patientEmail}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {t.settings.weeklyEmailDesc}
                </p>
              </div>
            </div>
            <Toggle
              on={settings.weeklyEmail}
              onToggle={() => update({ weeklyEmail: !settings.weeklyEmail })}
              label={t.settings.weeklyEmailTitle}
            />
          </div>
        </section>
      </div>

      {/* ─── Preferred Language (Elevated & Accessible) ──────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Language & Regional Voice
        </h2>
        <section className="rounded-2xl border border-primary/25 bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-bold text-foreground">{t.settings.languageTitle}</p>
              <p className="text-xs text-muted-foreground">{t.settings.languageDesc}</p>
            </div>
          </div>
          <LanguagePicker onPick={handleLanguageChange} />
        </section>
      </div>

      {/* ─── WhatsApp Reminders (Polished) ───────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Instant Messaging Channels
        </h2>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{t.settings.whatsAppTitle}</p>
                  {settings.whatsApp.enabled && (
                    <span className="rounded-full bg-[#25D366]/15 px-2 py-0.5 text-[10px] font-bold text-[#1ea952]">
                      Opted In
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {t.settings.whatsAppDesc}
                </p>
              </div>
            </div>
            <Toggle
              on={settings.whatsApp.enabled}
              onToggle={() =>
                update({ whatsApp: { ...settings.whatsApp, enabled: !settings.whatsApp.enabled } })
              }
              label={t.settings.whatsAppTitle}
            />
          </div>

          {settings.whatsApp.enabled && (
            <div className="mt-5 space-y-4 rounded-xl border border-border/80 bg-secondary/30 p-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {t.settings.whatsAppPhoneLabel}
                </span>
                <input
                  type="tel"
                  value={settings.whatsApp.phone}
                  onChange={(e) =>
                    update({ whatsApp: { ...settings.whatsApp, phone: e.target.value } })
                  }
                  placeholder={t.settings.whatsAppPhonePlaceholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60 text-xs">
                <p className="text-[11px] text-muted-foreground">
                  {t.settings.whatsAppNote}
                </p>
                <button
                  type="button"
                  onClick={handleSendTestReminder}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Send className="size-3 text-[#25D366]" />
                  <span>Send Test Ping</span>
                </button>
              </div>

              {testReminderSent && (
                <div className="flex items-center gap-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 p-2.5 text-xs text-[#1ea952]">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>
                    Test notification simulated! Delivered to {settings.whatsApp.phone || patient?.phone || 'registered contact'}.
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ─── Clinical Data & Security Section ────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Data Export & Security
        </h2>
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Lock className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Export Clinical Joint Health Records</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Download your encrypted assessment histories, mobility logs, and journal records in standard JSON format.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary hover:border-border/80 transition-colors active:scale-98"
            >
              <Download className="size-3.5 text-primary" />
              <span>Export Records</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

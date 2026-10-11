'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ArrowLeft, Mail, Lock, User, LogIn, ShieldCheck, Stethoscope, Languages, CalendarDays, IdCard, ImagePlus, CheckSquare, Eye, EyeOff } from 'lucide-react'
import type { ViewState } from '@/lib/data'
import { useTranslation, languageLabels, type Language } from '@/lib/i18n/context'
import { useAuth } from '@/components/session-provider'
import { Logo } from '@/components/ui/logo'

export function AuthView({ onNavigate }: { onNavigate: (v: ViewState) => void }) {
  const { t, language, setLanguage } = useTranslation()
  const { refresh } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<'patient' | 'staff'>('patient')
  const [langOpen, setLangOpen] = useState(false)
  const [verifyChecked, setVerifyChecked] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Verification step state
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [previewCode, setPreviewCode] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  async function handleVerifyEmail(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, code: verificationCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check your code.')
        setIsLoading(false)
        return
      }
      await refresh()
      onNavigate('dashboard')
    } catch (err: any) {
      setError(err?.message || 'Verification failed.')
      setIsLoading(false)
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isLoading) return
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to resend code.')
      } else {
        if (data.previewCode) setPreviewCode(data.previewCode)
        setResendCooldown(30)
      }
    } catch {
      setError('Failed to resend code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <button
          type="button"
          onClick={() => onNavigate('public')}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.nav.backToHome}
        </button>

        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Change language"
            >
              <Languages className="size-4" />
              {languageLabels[language]}
            </button>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-xl border border-border bg-card shadow-lg z-50"
              >
                {(Object.keys(languageLabels) as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { setLanguage(l); setLangOpen(false) }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                      language === l ? 'font-semibold text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {languageLabels[l]}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Logo variant="full" size="sm" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="p-8">
              {step === 'verify' ? (
                <div>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                      <Mail className="size-7" />
                    </div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Verify Your Email</h1>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      We sent a 6-digit verification code to <span className="font-semibold text-foreground">{verificationEmail}</span>
                    </p>
                  </div>

                  {previewCode && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-2.5 text-xs text-primary">
                      <span>Demo Code: <strong className="tracking-widest font-mono text-sm">{previewCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setVerificationCode(previewCode)}
                        className="font-bold underline hover:opacity-80 cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
                      {error}
                    </div>
                  )}

                  <form className="mt-6 space-y-4" onSubmit={handleVerifyEmail}>
                    <div>
                      <label className="mb-2 block text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="w-full text-center font-mono text-3xl font-bold tracking-[0.4em] rounded-xl border border-border bg-background py-3.5 px-4 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.length !== 6}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck className="size-4" />
                      {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                    </button>
                  </form>

                  <div className="mt-6 flex flex-col items-center gap-3 text-center text-xs">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleResendCode}
                      className={`font-semibold text-primary hover:underline ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form')
                        setError('')
                      }}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      ← Use a different email
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h1 className="font-serif text-2xl font-bold tracking-tight">
                      {mode === 'login' ? t.auth.welcomeBack : t.auth.createAccount}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {mode === 'login' ? t.auth.loginSubtitle : t.auth.signupSubtitle}
                    </p>
                  </div>

                  {/* Mode toggle */}
                  <div className="mt-6 flex rounded-xl border border-border bg-secondary/60 p-1">
                    {(['login', 'signup'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                          mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                        }`}
                      >
                        {m === 'login' ? t.auth.signInTab : t.auth.signUpTab}
                      </button>
                    ))}
                  </div>

                  <form
                    className="mt-6 space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (mode === 'signup' && !verifyChecked) {
                        alert('Please verify your details.')
                        return
                      }
                      
                      setError('')
                      setIsLoading(true)
                      
                      try {
                        if (mode === 'signup') {
                          if (!name || !email || !password) {
                            setError('Please fill in all required fields.')
                            setIsLoading(false)
                            return
                          }

                          const regRes = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email, password, role: role.toUpperCase() }),
                          })

                          const regData = await regRes.json()
                          if (!regRes.ok) {
                            setError(regData.error || 'Failed to create account.')
                            setIsLoading(false)
                            return
                          }

                          if (regData.requiresVerification) {
                            setVerificationEmail(email)
                            setPreviewCode(regData.previewCode || null)
                            setStep('verify')
                            setResendCooldown(30)
                            setIsLoading(false)
                            return
                          }

                          await refresh()
                          onNavigate('dashboard')
                        } else if (mode === 'login') {
                          if (!email || !password) {
                            setError('Please enter your email and password.')
                            setIsLoading(false)
                            return
                          }

                          const logRes = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password }),
                          })

                          const logData = await logRes.json()
                          if (!logRes.ok) {
                            setError(logData.error || 'Invalid email or password.')
                            setIsLoading(false)
                            return
                          }

                          if (logData.requiresVerification) {
                            setVerificationEmail(email)
                            setPreviewCode(logData.previewCode || null)
                            setStep('verify')
                            setResendCooldown(30)
                            setIsLoading(false)
                            return
                          }

                          await refresh()
                          onNavigate('dashboard')
                        }
                      } catch (err: any) {
                        setError(err.message || 'An error occurred during authentication')
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                  >
                    {mode === 'signup' && (
                      <>
                        <div className="flex flex-col items-center justify-center gap-2 mb-4">
                          <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors cursor-pointer overflow-hidden">
                            {profilePic ? (
                              <img src={profilePic} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <ImagePlus className="size-6" />
                            )}
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setProfilePic(URL.createObjectURL(file))
                                }
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{t.auth.pictureLabel}</span>
                        </div>
                        <Field 
                          icon={User} 
                          label={t.auth.fullNameLabel} 
                          type="text" 
                          placeholder="Aman Sharma" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Field icon={CalendarDays} label={t.auth.ageLabel} type="number" placeholder="45" min="0" max="200" />
                          <label className="block">
                            <span className="mb-1.5 block text-sm font-medium">{t.auth.genderLabel}</span>
                            <select className="w-full rounded-xl border border-border bg-background py-[11px] px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 appearance-none">
                              <option value="">--</option>
                              <option value="male">{t.auth.genderMale}</option>
                              <option value="female">{t.auth.genderFemale}</option>
                              <option value="other">{t.auth.genderOther}</option>
                            </select>
                          </label>
                        </div>
                        <Field icon={IdCard} label={t.auth.abhaIdLabel} type="text" placeholder={t.auth.abhaIdPlaceholder} />
                      </>
                    )}
                    
                    <Field 
                      icon={Mail} 
                      label={t.auth.emailLabel} 
                      type="email" 
                      placeholder="patient@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Field 
                      icon={Lock} 
                      label={t.auth.passwordLabel} 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    {mode === 'signup' && (
                      <label className="flex items-start gap-2.5 pt-1">
                        <input 
                          type="checkbox" 
                          className="mt-0.5 size-4 rounded border-border accent-primary"
                          checked={verifyChecked}
                          onChange={(e) => setVerifyChecked(e.target.checked)}
                          required
                        />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {t.auth.verifyLabel}
                        </span>
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
                    >
                      <LogIn className="size-4" aria-hidden="true" />
                      {isLoading ? 'Signing in...' : (mode === 'login' ? t.auth.signInBtn : t.auth.signUpBtn)}
                    </button>
                  </form>

                  <div className="mt-5 rounded-xl border border-dashed border-border/80 bg-muted/30 p-3 text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Demo Accounts (Click to Auto-fill):
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('aman.sharma@example.com')
                          setPassword('Patient@123')
                          setMode('login')
                          setError('')
                        }}
                        className="rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-primary shadow-xs border border-border hover:bg-secondary transition-colors cursor-pointer"
                      >
                        👤 Patient (Aman)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('dr.sharma@jointcare.in')
                          setPassword('Clinic@123')
                          setMode('login')
                          setError('')
                        }}
                        className="rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-primary shadow-xs border border-border hover:bg-secondary transition-colors cursor-pointer"
                      >
                        🩺 Doctor (Dr. Sharma)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-border bg-secondary/50 px-8 py-4">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">{t.auth.privacyBadge}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  type,
  placeholder,
  min,
  max,
  value,
  onChange,
}: {
  icon: typeof Mail
  label: string
  type: string
  placeholder: string
  min?: number | string
  max?: number | string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [internalVal, setInternalVal] = useState(value !== undefined ? String(value) : '')
  const [showPassword, setShowPassword] = useState(false)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value
    if (type === 'number' && min !== undefined && max !== undefined && raw !== '') {
      const num = parseInt(raw, 10)
      const minNum = Number(min)
      const maxNum = Number(max)
      if (!isNaN(num)) {
        if (num > maxNum) raw = String(maxNum)
        if (num < minNum) raw = String(minNum)
      }
    }
    setInternalVal(raw)
    e.target.value = raw
    if (onChange) {
      onChange(e)
    }
  }

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        {type === 'number' && min !== undefined && max !== undefined && (
          <span className="text-[11px] font-normal text-muted-foreground">({min} - {max})</span>
        )}
      </span>
      <span className="relative flex items-center">
        <Icon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden="true" />
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          min={min}
          max={max}
          value={value !== undefined ? value : internalVal}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (type === 'number' && (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.')) {
              e.preventDefault()
            }
          }}
          className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-9 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </span>
    </label>
  )
}

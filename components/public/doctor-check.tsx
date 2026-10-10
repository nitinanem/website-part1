'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Stethoscope,
  Check,
  X,
  RotateCcw,
  TriangleAlert,
  ClipboardList,
  Sparkles,
  Mic,
  Volume2,
  Download,
  Loader2,
  FileText,
  Printer,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation, interpolate } from '@/lib/i18n/context'
import { VoiceFormAssistant } from '@/components/voice/voice-form-assistant'

type Answers = Record<string, boolean>

export function DoctorCheck() {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<Answers>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null)
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const answeredCount = Object.keys(answers).length
  const yesCount = Object.values(answers).filter(Boolean).length
  const parsedAge = parseInt(age, 10)
  const isAgeValid = age !== '' && !isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 200
  const allAnswered = answeredCount === t.doctorCheck.questions.length && isAgeValid && gender !== '' && name.trim() !== ''

  function handleAgeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      setAge('')
      return
    }
    const val = parseInt(raw, 10)
    if (isNaN(val)) return
    if (val < 0) {
      setAge('0')
      return
    }
    if (val > 200) {
      setAge('200')
      return
    }
    setAge(val.toString())
  }

  function setAnswer(questionId: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function reset() {
    setAnswers({})
    setSubmitted(false)
    setAge('')
    setGender('')
    setName('')
    setEmail('')
    setPhone('')
    setSavedAssessmentId(null)
  }

  function handleVoiceFieldUpdate(field: string, value: any) {
    if (field === 'name') setName(String(value))
    else if (field === 'age') setAge(String(value))
    else if (field === 'gender') setGender(String(value))
    else if (field === 'phone') setPhone(String(value))
    else if (field.startsWith('q')) {
      setAnswers((prev) => ({ ...prev, [field]: Boolean(value) }))
    }
  }

  const recommendation =
    yesCount >= 3
      ? {
          tone: 'high' as const,
          title: t.doctorCheck.highRiskTitle,
          body: t.doctorCheck.highRiskBody,
        }
      : {
          tone: 'low' as const,
          title: t.doctorCheck.lowRiskTitle,
          body: t.doctorCheck.lowRiskBody,
        }

  async function handleSubmit() {
    setIsSubmitting(true)
    
    // Submit to PostgreSQL assessments table
    try {
      const res = await fetch('/api/assessment-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          age: parsedAge,
          gender,
          score: yesCount,
          recommendation: recommendation.tone,
          answers,
          timestamp: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.assessmentId) setSavedAssessmentId(data.assessmentId)
      }
    } catch (error) {
      console.error('Failed to submit assessment to database:', error)
      // We proceed to show the result anyway to avoid blocking the user experience
    }
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  async function handleDownloadPDF() {
    setIsDownloading(true)
    try {
      const cleanName = (name.trim() || 'Patient').replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_')
      const dateStr = new Date().toISOString().slice(0, 10)
      const reportEl = document.getElementById('doctor-check-report-card')

      let pdfSaved = false

      if (reportEl) {
        try {
          const { toPng } = await import('html-to-image')
          
          // Render on fixed 800px width with 2.5x pixel ratio for 300 DPI true print quality
          const dataUrl = await toPng(reportEl, {
            quality: 1,
            pixelRatio: 2.5,
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: {
              width: '800px',
              maxWidth: '800px',
              margin: '0',
              borderRadius: '0px',
              boxShadow: 'none',
            },
          })

          const { jsPDF } = await import('jspdf')
          const pdf = new jsPDF('p', 'mm', 'a4')
          const pageW = 210
          const pageH = 297
          const margin = 10
          const imgW = pageW - margin * 2 // 190mm

          // Load image to determine exact aspect ratio
          const img = new Image()
          img.src = dataUrl
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = reject
          })

          const imgH = (img.height * imgW) / img.width
          const printableH = pageH - margin * 2 // 277mm

          if (imgH <= printableH) {
            // Fits cleanly on 1 page; center vertically if slight space remains
            const yPos = margin + Math.max(0, (printableH - imgH) / 6)
            pdf.addImage(dataUrl, 'PNG', margin, yPos, imgW, imgH)
          } else {
            // If slightly taller than 1 page, scale down proportionally to fit on 1 page
            const scale = printableH / imgH
            const scaledW = imgW * scale
            const xPos = margin + (imgW - scaledW) / 2
            pdf.addImage(dataUrl, 'PNG', xPos, margin, scaledW, printableH)
          }

          pdf.save(`Swastik_Screening_Report_${cleanName}_${dateStr}.pdf`)
          pdfSaved = true
        } catch (imgErr) {
          console.warn('[PDF Export] html-to-image error, attempting canvas fallback:', imgErr)
        }
      }

      if (!pdfSaved) {
        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pageW = 210
        const margin = 15

        // Header
        pdf.setFillColor(15, 118, 110)
        pdf.rect(0, 0, pageW, 26, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Swastik Assessment Report', margin, 12)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Knee & Joint Screening Self-Assessment Report', margin, 19)
        pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageW - margin, 19, { align: 'right' })

        let y = 35

        // Patient Details box with complete fields
        pdf.setFillColor(243, 244, 246)
        pdf.roundedRect(margin, y, pageW - margin * 2, 32, 2, 2, 'F')
        pdf.setTextColor(17, 24, 39)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Patient Demographics', margin + 4, y + 7)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        const safeName = name.trim().replace(/[^\x00-\x7F]/g, '').trim() || 'Patient'
        pdf.text(`Name: ${safeName}`, margin + 4, y + 14)
        pdf.text(`Age: ${parsedAge ? `${parsedAge} yrs` : 'N/A'}`, margin + 70, y + 14)
        pdf.text(`Gender: ${gender ? (gender === 'female' ? 'Female' : gender === 'male' ? 'Male' : 'Other') : 'N/A'}`, margin + 120, y + 14)
        pdf.text(`Phone: ${phone.trim() || 'N/A'}`, margin + 4, y + 21)
        pdf.text(`Email: ${email.trim() || 'N/A'}`, margin + 70, y + 21)
        if (savedAssessmentId) {
          pdf.text(`Ref ID: ${savedAssessmentId}`, margin + 120, y + 21)
        }
        pdf.text(`Score: ${yesCount} / 5 Symptoms Reported (${recommendation.tone === 'high' ? 'High Risk' : 'Low Risk'})`, margin + 4, y + 28)

        y += 40

        // Clinical Result Box
        const isHigh = recommendation.tone === 'high'
        pdf.setFillColor(isHigh ? 254 : 240, isHigh ? 242 : 253, isHigh ? 242 : 244)
        pdf.setDrawColor(isHigh ? 239 : 34, isHigh ? 68 : 197, isHigh ? 68 : 94)
        pdf.roundedRect(margin, y, pageW - margin * 2, 26, 2, 2, 'FD')

        pdf.setTextColor(isHigh ? 185 : 22, isHigh ? 28 : 101, isHigh ? 28 : 52)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Screening Result: ${isHigh ? 'High Risk of Osteoarthritis' : 'Low Risk / Mild Symptoms'} (${yesCount} / 5 Yes)`, margin + 5, y + 8)
        pdf.setFontSize(8.5)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(55, 65, 81)
        const englishRecBody = isHigh
          ? 'Based on responses, multiple signs correlate with knee/joint osteoarthritis. Consultation with an orthopedic specialist or physical therapist is advised.'
          : 'Reported symptoms are mild. Maintaining active mobility and joint-friendly exercises is recommended. Re-evaluate if pain persists.'
        const recLines = pdf.splitTextToSize(englishRecBody, pageW - margin * 2 - 10)
        pdf.text(recLines, margin + 5, y + 15)

        y += 34

        // Question-by-Question Breakdown in clean English
        pdf.setTextColor(17, 24, 39)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Symptom Checklist Responses:', margin, y)
        y += 5

        const standardQuestions = [
          '1. Persistent knee or joint pain lasting more than a few weeks?',
          '2. Morning or post-rest joint stiffness?',
          '3. Difficulty with walking or climbing stairs?',
          '4. Joint swelling, cracking, or grating sounds (crepitus)?',
          '5. Pain progressively worsening over time?',
        ]

        standardQuestions.forEach((qText, i) => {
          const qId = `q${i + 1}`
          const isAffirm = answers[qId] === true
          pdf.setFillColor(i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 251 : 255)
          pdf.rect(margin, y, pageW - margin * 2, 9, 'F')
          pdf.setFontSize(8.5)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(31, 41, 55)
          pdf.text(qText, margin + 3, y + 6)

          pdf.setFont('helvetica', 'bold')
          if (isAffirm) {
            pdf.setTextColor(185, 28, 28)
            pdf.text('YES', pageW - margin - 15, y + 6)
          } else {
            pdf.setTextColor(22, 101, 52)
            pdf.text('NO', pageW - margin - 15, y + 6)
          }
          y += 9.5
        })

        y += 6

        // Doctor Review & Signature Box
        pdf.setDrawColor(209, 213, 219)
        pdf.roundedRect(margin, y, pageW - margin * 2, 32, 2, 2, 'D')
        pdf.setFontSize(8.5)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(75, 85, 99)
        pdf.text('Clinical Evaluation & Notes (To be filled by Doctor):', margin + 4, y + 6)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Findings: [ ] Crepitus    [ ] Effusion    [ ] Tenderness    ROM: ___________________', margin + 4, y + 14)
        pdf.text('Plan: [ ] X-Ray AP/Lat    [ ] Physiotherapy    [ ] Follow-up in: ___________________', margin + 4, y + 21)
        pdf.text('Physician Signature: _______________________      Date: _______________', margin + 4, y + 28)

        y += 38

        // Disclaimer
        pdf.setFontSize(7)
        pdf.setTextColor(156, 163, 175)
        pdf.text('Disclaimer: This is a preliminary screening report, not a clinical diagnosis. Radiographic or physical evaluation by a physician is required for definitive assessment.', margin, y)

        pdf.save(`Swastik_Screening_Report_${cleanName}_${dateStr}.pdf`)
      }
    } catch (err) {
      console.error('Failed to download report:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section id="doctor-check" className="bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-3xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
            <ClipboardList className="size-3.5" aria-hidden="true" />
            {t.doctorCheck.badge}
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t.doctorCheck.title}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">
            {t.doctorCheck.subtitle}
          </p>
        </div>

        {/* Senior Voice Assistant Activation Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <Mic className="size-6 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">
                  {t.voiceAssistant.startVoiceBtn}
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-500/30">
                  {t.voiceAssistant.seniorCareBadge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {t.voiceAssistant.seniorHelpHint}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
          >
            <Volume2 className="size-4" />
            <span>{t.voiceAssistant.startVoiceBtn}</span>
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="divide-y divide-border"
              >
                <div className="flex flex-col gap-4 p-5 border-b border-border bg-secondary/10">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex-1">
                      <span className="mb-1.5 block text-sm font-medium">{t.doctorCheck.nameLabel} <span className="text-destructive">*</span></span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.doctorCheck.namePlaceholder}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex-1">
                      <span className="mb-1.5 block text-sm font-medium">{t.doctorCheck.emailLabel}</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.doctorCheck.emailPlaceholder}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    </label>
                    <label className="flex-1">
                      <span className="mb-1.5 block text-sm font-medium">{t.doctorCheck.phoneLabel}</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t.doctorCheck.phonePlaceholder}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 bg-secondary/20">
                  <label className="flex-1">
                    <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
                      <span>{t.auth.ageLabel}</span>
                      <span className="text-[11px] font-normal text-muted-foreground">(0 - 200)</span>
                    </span>
                    <input
                      type="number"
                      value={age}
                      onChange={handleAgeChange}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                          e.preventDefault()
                        }
                      }}
                      min={0}
                      max={200}
                      placeholder="e.g. 55"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="mb-1.5 block text-sm font-medium">{t.auth.genderLabel}</span>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-[9px] px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 appearance-none"
                    >
                      <option value="">--</option>
                      <option value="male">{t.auth.genderMale}</option>
                      <option value="female">{t.auth.genderFemale}</option>
                      <option value="other">{t.auth.genderOther}</option>
                    </select>
                  </label>
                </div>
                {t.doctorCheck.questions.map((q, i) => (
                  <div key={q.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-3 text-sm font-medium leading-relaxed">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      {q.text}
                    </p>
                    <div className="flex shrink-0 gap-2 pl-9 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => setAnswer(q.id, true)}
                        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                          answers[q.id] === true
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary/40 hover:bg-accent/40'
                        }`}
                      >
                        <Check className="size-4" aria-hidden="true" /> {t.common.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswer(q.id, false)}
                        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                          answers[q.id] === false
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border bg-background hover:border-foreground/30 hover:bg-secondary'
                        }`}
                      >
                        <X className="size-4" aria-hidden="true" /> {t.common.no}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-4 bg-secondary/50 p-5">
                  <span className="text-sm text-muted-foreground">
                    {interpolate(t.doctorCheck.answeredOf, { done: answeredCount, total: t.doctorCheck.questions.length })}
                  </span>
                  <button
                    type="button"
                    disabled={!allAnswered || isSubmitting}
                    onClick={handleSubmit}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs flex items-center gap-2"
                  >
                    {isSubmitting ? 'Saving...' : t.doctorCheck.seeRecommendation}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-8 text-center"
              >
                {/* Visual Recommendation Badge */}
                <span
                  className={`mx-auto flex size-14 items-center justify-center rounded-full ${
                    recommendation.tone === 'high'
                      ? 'bg-accent text-primary'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {recommendation.tone === 'high' ? (
                    <Stethoscope className="size-7" aria-hidden="true" />
                  ) : (
                    <Check className="size-7" aria-hidden="true" />
                  )}
                </span>
                <h3 className="mt-4 font-serif text-2xl font-bold text-balance">{recommendation.title}</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground text-pretty">
                  {recommendation.body}
                </p>

                {/* Downloadable & Printable Clinical Report Card */}
                <div
                  id="doctor-check-report-card"
                  style={{ backgroundColor: '#ffffff', color: '#111827' }}
                  className="mx-auto mt-6 w-full max-w-2xl sm:max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 sm:p-7 text-left shadow-sm print:shadow-none print:border-none print:p-0"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between border-b-2 border-gray-900 pb-3.5">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/swastik-icon.png"
                        alt="Swastik Emblem"
                        width={44}
                        height={44}
                        className="size-10 sm:size-11 object-contain rounded-xl shrink-0 shadow-xs"
                      />
                      <div>
                        <h4 className="font-serif text-base sm:text-lg font-bold tracking-tight text-gray-900">
                          Swastik™ Clinical Assessment Report
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                          Knee & Joint Health Self-Screening Protocol • Swastik National Platform
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="inline-block rounded-md bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-800">
                        Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">
                        Ref ID: {savedAssessmentId || 'SW-ASSESS-LOCAL'}
                      </p>
                    </div>
                  </div>

                  {/* Patient Demographics */}
                  <div className="my-3.5 rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Patient Name</span>
                        <span className="font-bold text-gray-900 text-xs sm:text-sm block mt-0.5 truncate">{name.trim() || 'Anonymous'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Age / Gender</span>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm block mt-0.5">
                          {parsedAge ? `${parsedAge} yrs` : 'N/A'} • {gender === 'female' ? 'Female' : gender === 'male' ? 'Male' : gender || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Phone</span>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm block mt-0.5 truncate">{phone.trim() || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Email</span>
                        <span className="font-semibold text-gray-800 text-xs block mt-0.5 truncate" title={email.trim() || 'N/A'}>
                          {email.trim() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Triage Score</span>
                        <span className={`font-bold text-xs block mt-0.5 ${recommendation.tone === 'high' ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {yesCount} of 5 Yes ({recommendation.tone === 'high' ? 'High Risk' : 'Low Risk'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Screening Result & Clinical Recommendation */}
                  <div
                    className={`my-3.5 rounded-xl border p-3.5 text-left ${
                      recommendation.tone === 'high'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          recommendation.tone === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {recommendation.tone === 'high' ? 'High Risk of Osteoarthritis' : 'Low Risk / Mild Symptoms'} ({yesCount} / 5 Yes)
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Clinical Triage Indicator
                      </span>
                    </div>
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 mt-1">
                      {recommendation.title}
                    </h5>
                    <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-gray-700">
                      {recommendation.body}
                    </p>
                  </div>

                  {/* Question & Answer Summary */}
                  <div className="my-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        Symptom Checklist & Self-Assessment Responses:
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">5 Questions Screened</span>
                    </div>
                    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden text-xs">
                      {t.doctorCheck.questions.map((q, i) => {
                        const isYes = answers[q.id] === true
                        return (
                          <div key={q.id} className="flex items-center justify-between gap-3 px-3 py-2">
                            <span className="flex-1 text-gray-800 leading-snug font-medium text-[11px] sm:text-xs">
                              <strong className="text-gray-400 mr-1.5">{i + 1}.</strong>
                              {q.text}
                            </span>
                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                isYes
                                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              }`}
                            >
                              {isYes ? <Check className="size-3" /> : <X className="size-3" />}
                              <span>{isYes ? t.common.yes : t.common.no}</span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Doctor's Clinical Evaluation & Notes Section */}
                  <div className="my-3.5 rounded-xl border border-gray-300 bg-gray-50/60 p-3 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2">
                      <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">
                        Clinical Evaluation & Notes (To be filled by Consulting Physician)
                      </span>
                      <span className="text-[10px] text-gray-500">ICD-10 M17 Protocol</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 mb-2 text-[10px]">
                      <div>
                        <span className="font-semibold text-gray-700">Physical Exam: </span>
                        Crepitus [ &nbsp; ] &nbsp;•&nbsp; Effusion [ &nbsp; ] &nbsp;•&nbsp; ROM: _________
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Next Steps: </span>
                        [ &nbsp; ] X-Ray &nbsp;•&nbsp; [ &nbsp; ] Physiotherapy &nbsp;•&nbsp; [ &nbsp; ] Follow-up
                      </div>
                    </div>

                    <div className="h-9 rounded-md border border-dashed border-gray-300 bg-white px-2 py-1 text-gray-400 text-[10px] mb-2.5">
                      Doctor&apos;s Clinical Findings / Impression / Recommendations:
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-0.5 text-[10px] text-gray-700">
                      <div>
                        <span className="block text-gray-500 text-[9px]">Physician Signature</span>
                        <span className="block border-b border-gray-400 mt-2 h-3"></span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-[9px]">Date / Reg. Number</span>
                        <span className="block border-b border-gray-400 mt-2 h-3"></span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="block text-gray-500 text-[9px]">Clinic / Hospital Stamp</span>
                        <div className="border border-dashed border-gray-300 rounded h-7 mt-0.5 flex items-center justify-center text-[9px] text-gray-400">
                          [ Official Stamp ]
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Disclaimer */}
                  <div className="mt-2.5 flex items-start gap-2 text-[10px] leading-relaxed text-gray-500 border-t border-gray-200 pt-2">
                    <TriangleAlert className="size-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong>Notice:</strong> {t.doctorCheck.disclaimer}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[9px] text-gray-400 text-center">
                    Swastik National Digital Joint Health Platform • Validated Screening Protocol • Page 1 of 1
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t.doctorCheck.downloadingReport}</span>
                      </>
                    ) : (
                      <>
                        <Download className="size-4" />
                        <span>{t.doctorCheck.downloadReport}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
                    title="Print report or save via browser print dialog"
                  >
                    <Printer className="size-4 text-muted-foreground" />
                    <span>Print / Save PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary cursor-pointer"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" /> {t.doctorCheck.startOver}
                  </button>

                  <Link
                    href="/portal"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-secondary/70 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    <Sparkles className="size-4 text-primary" />
                    <span>Start Full AI Assessment</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceFormAssistant
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        formData={{
          name,
          age,
          gender,
          phone,
          answers,
        }}
        onUpdateField={handleVoiceFieldUpdate}
        onSubmit={handleSubmit}
        questions={t.doctorCheck.questions}
      />
    </section>
  )
}



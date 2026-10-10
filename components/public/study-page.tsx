'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  HeartPulse,
  Apple,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  FileText,
  ExternalLink,
  ChevronRight,
  Languages,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Share2,
  Printer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  Film,
  Award,
  Lock,
} from 'lucide-react'
import { useTranslation, languageLabels, type Language } from '@/lib/i18n/context'
import type { ViewState, StudyTopicId } from '@/lib/data'
import { useSpeechNarrator } from '@/lib/tts/use-speech-narrator'
import type { NarratorSection } from '@/lib/tts/speech-narrator'
import { AudioPlayerBar } from '@/components/public/audio-player-bar'
import { StudyVisual } from '@/components/public/study-visual'
import { MediaLightbox, type LightboxItem } from '@/components/public/media-lightbox'
import { useEngagementTracker } from '@/lib/training/use-engagement-tracker'
import { MasteryExamModal } from '@/components/training/mastery-exam'

interface StudyPageProps {
  topicId: StudyTopicId
  onSelectTopic: (id: StudyTopicId) => void
  onNavigate: (view: ViewState) => void
}

const topicMeta: Record<
  StudyTopicId,
  { icon: typeof BookOpen; order: number; color: string; badgeBg: string }
> = {
  'know-oa': {
    icon: BookOpen,
    order: 1,
    color: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
  },
  symptoms: {
    icon: HeartPulse,
    order: 2,
    color: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  },
  diet: {
    icon: Apple,
    order: 3,
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  exercise: {
    icon: Activity,
    order: 4,
    color: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
}

const topicOrder: StudyTopicId[] = ['know-oa', 'symptoms', 'diet', 'exercise']

export function StudyPage({ topicId, onSelectTopic, onNavigate }: StudyPageProps) {
  const { t, language, setLanguage } = useTranslation()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({})
  const [copied, setCopied] = useState(false)
  const [lightboxItem, setLightboxItemRaw] = useState<LightboxItem | null>(null)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)

  const { milestones, recordVisualZoom, recordSectionView } = useEngagementTracker(topicId)

  const setLightboxItem = useCallback(
    (item: LightboxItem | null) => {
      if (item) {
        recordVisualZoom(item.src)
      }
      setLightboxItemRaw(item)
    },
    [recordVisualZoom]
  )

  const narrator = useSpeechNarrator()
  const study = t.study
  const page = study.pages[topicId]
  const meta = topicMeta[topicId]
  const Icon = meta.icon
  const audioDict = study.audioGuide

  const currentIndex = topicOrder.indexOf(topicId)
  const prevTopicId = currentIndex > 0 ? topicOrder[currentIndex - 1] : null
  const nextTopicId = currentIndex < topicOrder.length - 1 ? topicOrder[currentIndex + 1] : null

  // Extract all sections of this page for the Speech Synthesizer
  const fullNarratorSections: NarratorSection[] = useMemo(() => {
    const sections: NarratorSection[] = []

    // 1. Intro
    sections.push({
      id: 'intro',
      title: page.title,
      text: `${page.title}. ${page.subtitle}.`,
    })

    // 2. Takeaways
    if (page.keyTakeaways?.length > 0) {
      const takeawaysText = page.keyTakeaways
        .map((tk, idx) => `Key takeaway ${idx + 1}: ${tk.title}. ${tk.description}`)
        .join(' ')
      sections.push({
        id: 'takeaways',
        title: study.keyTakeawaysTitle,
        text: `${study.keyTakeawaysTitle}. ${takeawaysText}`,
      })
    }

    // 3. Detailed Deep Dives
    page.sections.forEach((sec, idx) => {
      const bodyText = sec.body.join(' ')
      const pointsText =
        sec.keyPoints && sec.keyPoints.length > 0
          ? `Key points: ${sec.keyPoints.join('. ')}.`
          : ''
      const highlightText = sec.highlight ? `Note: ${sec.highlight}.` : ''
      sections.push({
        id: `section-${idx}`,
        title: sec.heading,
        text: `${sec.heading}. ${bodyText} ${pointsText} ${highlightText}`,
      })
    })

    // 4. Action Plan
    if (page.actionPlan) {
      const dosText = `Recommended do's: ${page.actionPlan.dos.join('. ')}.`
      const dontsText = `Important don'ts: ${page.actionPlan.donts.join('. ')}.`
      sections.push({
        id: 'action-plan',
        title: page.actionPlan.title,
        text: `${page.actionPlan.title}. ${dosText} ${dontsText}`,
      })
    }

    return sections
  }, [page, study])

  function handlePlayFullAudio() {
    if (narrator.isPlaying) {
      narrator.pause()
    } else if (narrator.isPaused) {
      narrator.resume()
    } else {
      narrator.speak(fullNarratorSections)
    }
  }

  function handlePlaySection(secId: string, title: string, text: string) {
    narrator.speakSection({
      id: secId,
      title,
      text,
    })
  }

  function handleSelectOption(qIndex: number, optIndex: number) {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
  }

  function handleCheckAnswer(qIndex: number) {
    if (userAnswers[qIndex] !== undefined) {
      setSubmittedAnswers((prev) => ({ ...prev, [qIndex]: true }))
    }
  }

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      {/* ── Sticky Study Navigation Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                narrator.stop()
                onNavigate('public')
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{study.backToHub}</span>
              <span className="sm:hidden">{t.common.back}</span>
            </button>
            <div className="hidden h-5 w-px bg-border md:block" />
            <span className="hidden items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase md:flex">
              <GraduationCap className="size-4 text-primary" />
              {study.studyGuideBadge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Audio Guide Trigger in Top Bar */}
            {narrator.supported && (
              <button
                type="button"
                onClick={handlePlayFullAudio}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  narrator.isPlaying
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm animate-pulse'
                    : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                title={audioDict.listenFullPage}
              >
                {narrator.isPlaying ? <Pause className="size-3.5" /> : <Volume2 className="size-3.5" />}
                <span className="hidden sm:inline">
                  {narrator.isPlaying ? audioDict.pause : audioDict.listenFullPage}
                </span>
              </button>
            )}

            {/* Language Picker Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Change language"
              >
                <Languages className="size-3.5 text-primary" />
                <span>{languageLabels[language]}</span>
              </button>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1.5 w-36 overflow-hidden rounded-xl border border-border bg-card shadow-xl z-50"
                >
                  {(Object.keys(languageLabels) as Language[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        narrator.stop()
                        setLanguage(l)
                        setLangMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-secondary ${
                        language === l
                          ? 'bg-primary/10 font-bold text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <span>{languageLabels[l]}</span>
                      {language === l && <CheckCircle2 className="size-3.5 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Share and Print buttons */}
            <button
              type="button"
              onClick={handleShare}
              className="flex size-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Share guide link"
              aria-label="Share guide link"
            >
              <Share2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex size-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Print study guide"
              aria-label="Print study guide"
            >
              <Printer className="size-3.5" />
            </button>
          </div>
        </div>

        {/* ── Sub-header Module Selector Pills ──────────────────────────────── */}
        <div className="border-t border-border bg-secondary/30 px-4 py-2 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 hidden md:inline">
              {study.allModules}:
            </span>
            {topicOrder.map((id) => {
              const isActive = id === topicId
              const tMeta = topicMeta[id]
              const tIcon = tMeta.icon
              const TIconComponent = tIcon
              const moduleTitle = study.pages[id].tag

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    narrator.stop()
                    onSelectTopic(id)
                    setUserAnswers({})
                    setSubmittedAnswers({})
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border'
                  }`}
                >
                  <TIconComponent className="size-3.5" />
                  <span>
                    {tMeta.order}. {moduleTitle}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Main Study Content Container ─────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              narrator.stop()
              onNavigate('public')
            }}
            className="hover:text-foreground hover:underline"
          >
            {t.common.brandName}
          </button>
          <ChevronRight className="size-3" />
          <button
            type="button"
            onClick={() => {
              narrator.stop()
              onNavigate('public')
            }}
            className="hover:text-foreground hover:underline"
          >
            {t.nav.education}
          </button>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-primary">{page.tag}</span>
        </nav>

        {/* Hero Header Card */}
        <motion.section
          key={topicId + '-hero'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mt-4 rounded-3xl border bg-card p-6 sm:p-10 shadow-sm transition-all ${
            narrator.currentSectionId === 'intro' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${meta.badgeBg}`}
              >
                <Icon className="size-3.5" />
                {page.tag}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="size-3" />
                {page.readTime}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <GraduationCap className="size-3" />
                {page.level}
              </span>
            </div>

            {/* Listen Button for Intro */}
            {narrator.supported && (
              <button
                type="button"
                onClick={() => handlePlaySection('intro', page.title, `${page.title}. ${page.subtitle}`)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                title={audioDict.listenSection}
              >
                <Volume2 className="size-3.5 text-primary" />
                <span>{audioDict.listenSection}</span>
              </button>
            )}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {page.title}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {page.subtitle}
          </p>

          {/* Full Page Narration Banner */}
          {narrator.supported && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Volume2 className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {audioDict.audioGuideTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Listen to the entire study guide in {languageLabels[language]} voice.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlayFullAudio}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
              >
                {narrator.isPlaying ? (
                  <>
                    <Pause className="size-4" />
                    <span>{audioDict.pause}</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4 ml-0.5" />
                    <span>{audioDict.listenFullPage}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.section>

        {/* ── Anti-Skip Credentialing Progress Bar ────────────────────────────── */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-primary/5 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                  milestones.isEligible
                    ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {milestones.isEligible ? <ShieldCheck className="size-5" /> : <Award className="size-5" />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-sm font-bold text-foreground">
                    Clinical Training & Credential Progress
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      milestones.isEligible
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {milestones.isEligible ? 'Exam Eligible' : `${milestones.progressPercent}% Completed`}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    Active Study: {milestones.activeSeconds}s / {milestones.requiredSeconds}s
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <ZoomIn className="size-3" />
                    Visuals Inspected: {milestones.visualsZoomedCount} / {milestones.requiredVisuals}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExamModalOpen(true)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                milestones.isEligible
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {milestones.isEligible ? <Award className="size-4" /> : <Lock className="size-4" />}
              <span>
                {milestones.isEligible
                  ? 'Take Proctored Exam & Earn Credential'
                  : 'Exam Eligibility Criteria'}
              </span>
            </button>
          </div>

          {/* Progress Indicator line */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-500 ${
                milestones.isEligible ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${milestones.progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Key Takeaways Cards ──────────────────────────────────────────────── */}
        <motion.section
          key={topicId + '-takeaways'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="font-serif text-xl font-bold text-foreground">
                {study.keyTakeawaysTitle}
              </h2>
            </div>

            {narrator.supported && (
              <button
                type="button"
                onClick={() =>
                  handlePlaySection(
                    'takeaways',
                    study.keyTakeawaysTitle,
                    `${study.keyTakeawaysTitle}. ` +
                      page.keyTakeaways
                        .map((tk, idx) => `Key takeaway ${idx + 1}: ${tk.title}. ${tk.description}`)
                        .join(' ')
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title={audioDict.listenSection}
              >
                <Volume2 className="size-3.5 text-primary" />
                <span>{audioDict.listenSection}</span>
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {page.keyTakeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border bg-card p-5 shadow-xs transition-all ${
                  narrator.currentSectionId === 'takeaways'
                    ? 'border-primary ring-1 ring-primary/30 shadow-md'
                    : 'border-border/80 hover:shadow-md'
                }`}
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  0{idx + 1}
                </div>
                <h3 className="mt-3 font-serif text-base font-semibold text-foreground">
                  {takeaway.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {takeaway.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Interactive Clinical Visual Diagrams & Infographics ──────────────── */}
        <StudyVisual topicId={topicId} />

        {/* ── Deep Dive Detailed Clinical Sections ─────────────────────────────── */}
        <motion.section
          key={topicId + '-sections'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-8 space-y-8"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileText className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {study.deepDiveTitle}
            </h2>
          </div>

          {page.sections.map((section, sIdx) => {
            const isSpeakingThisSection = narrator.currentSectionId === `section-${sIdx}`
            return (
              <article
                key={sIdx}
                className={`rounded-2xl border bg-card p-6 sm:p-8 space-y-4 transition-all ${
                  isSpeakingThisSection
                    ? 'border-primary ring-2 ring-primary/25 shadow-lg bg-primary/[0.02]'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {section.heading}
                  </h3>

                  {narrator.supported && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePlaySection(
                          `section-${sIdx}`,
                          section.heading,
                          `${section.heading}. ${section.body.join(' ')} ${
                            section.keyPoints ? section.keyPoints.join('. ') : ''
                          } ${section.highlight || ''}`
                        )
                      }
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                        isSpeakingThisSection
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                      title={audioDict.listenSection}
                    >
                      <Volume2 className="size-3.5" />
                      <span>{audioDict.listenSection}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {section.body.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {/* Inline Section Clinical Visual Aid */}
                {renderSectionVisual(topicId, sIdx, setLightboxItem)}

                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Key Clinical Points:
                    </span>
                    <ul className="mt-2 space-y-2 text-xs sm:text-sm text-foreground/80">
                      {section.keyPoints.map((pt, ptIdx) => (
                        <li key={ptIdx} className="flex items-start gap-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.highlight && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200">
                    {section.highlight}
                  </div>
                )}
              </article>
            )
          })}
        </motion.section>

        {/* ── Action Plan: Do's and Don'ts ─────────────────────────────────────── */}
        <motion.section
          key={topicId + '-actionplan'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`mt-12 rounded-3xl border bg-card p-6 sm:p-8 transition-all ${
            narrator.currentSectionId === 'action-plan'
              ? 'border-primary ring-2 ring-primary/25 shadow-lg'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {page.actionPlan.title}
              </h2>
            </div>

            {narrator.supported && (
              <button
                type="button"
                onClick={() =>
                  handlePlaySection(
                    'action-plan',
                    page.actionPlan.title,
                    `${page.actionPlan.title}. Recommended do's: ${page.actionPlan.dos.join(
                      '. '
                    )}. Important don'ts: ${page.actionPlan.donts.join('. ')}.`
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title={audioDict.listenSection}
              >
                <Volume2 className="size-3.5 text-primary" />
                <span>{audioDict.listenSection}</span>
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Do's */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
                <h3 className="font-serif text-lg font-bold">{study.dosTitle}</h3>
              </div>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-foreground/85">
                {page.actionPlan.dos.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <XCircle className="size-5" />
                <h3 className="font-serif text-lg font-bold">{study.dontsTitle}</h3>
              </div>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-foreground/85">
                {page.actionPlan.donts.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ── Interactive Knowledge Self-Check Quiz ────────────────────────────── */}
        <motion.section
          key={topicId + '-quiz'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-12 rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {study.quizTitle}
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {study.quizSubtitle}
          </p>

          <div className="mt-6 space-y-6">
            {page.quiz.map((q, qIdx) => {
              const selected = userAnswers[qIdx]
              const isSubmitted = submittedAnswers[qIdx]
              const isCorrect = selected === q.correctIndex

              return (
                <div
                  key={qIdx}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4"
                >
                  <h4 className="font-serif text-base font-semibold text-foreground">
                    {qIdx + 1}. {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === optIdx
                      let btnStyle =
                        'border-border bg-card text-foreground hover:bg-secondary'

                      if (isSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100 font-semibold'
                        } else if (isOptionSelected && !isCorrect) {
                          btnStyle =
                            'border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-100'
                        }
                      } else if (isOptionSelected) {
                        btnStyle = 'border-primary bg-primary/10 text-primary font-semibold'
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && optIdx === q.correctIndex && (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {isSubmitted && isOptionSelected && !isCorrect && (
                            <XCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {!isSubmitted && (
                    <button
                      type="button"
                      disabled={selected === undefined}
                      onClick={() => handleCheckAnswer(qIdx)}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {study.checkAnswer}
                    </button>
                  )}

                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`rounded-xl border p-4 text-xs sm:text-sm ${
                        isCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200'
                      }`}
                    >
                      <p className="font-bold">
                        {isCorrect ? study.correctFeedback : study.incorrectFeedback}
                      </p>
                      <p className="mt-1 leading-relaxed">{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ── Evidence & References ────────────────────────────────────────────── */}
        <motion.section
          key={topicId + '-references'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {study.referencesTitle}
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {study.referencesSubtitle}
          </p>

          <div className="mt-6 space-y-4">
            {page.references.map((ref, rIdx) => (
              <div
                key={rIdx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                    {ref.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ref.authors} &bull; <span className="italic">{ref.source}</span> ({ref.year})
                  </p>
                </div>
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Read Paper</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Official Proctored Examination & Blockchain Credential Section ── */}
        <section className="mt-12 rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-primary/5 to-card p-6 sm:p-10 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Award className="size-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Accredited Certification Program
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Earn Your Verifiable Clinical Credential
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Prove your joint & bone health mastery through our anti-AI proctored examination. Earn an official, tamper-proof credential anchored on the Swastik Health Blockchain with 300 DPI PDF download and QR code verification.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsExamModalOpen(true)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold shadow-md transition-all cursor-pointer ${
                  milestones.isEligible
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 animate-pulse'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {milestones.isEligible ? (
                  <Award className="size-5" />
                ) : (
                  <Lock className="size-5 text-muted-foreground" />
                )}
                <span>
                  {milestones.isEligible
                    ? 'Take Proctored Mastery Exam'
                    : 'Unlock Mastery Exam (Fulfill Milestones)'}
                </span>
              </button>
              <span className="text-center text-[11px] text-muted-foreground italic">
                {milestones.isEligible
                  ? '80% Honors Passing Required • Cryptographically Verified'
                  : `${milestones.progressPercent}% of anti-skip study requirements completed`}
              </span>
            </div>
          </div>
        </section>

        {/* ── Bottom Module Navigation ─────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-8">
          {prevTopicId ? (
            <button
              type="button"
              onClick={() => {
                narrator.stop()
                onSelectTopic(prevTopicId)
                setUserAnswers({})
                setSubmittedAnswers({})
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="size-5 text-primary" />
              <div>
                <span className="text-xs text-muted-foreground">{study.prevModule}</span>
                <p className="text-sm font-bold text-foreground">
                  {study.pages[prevTopicId].title}
                </p>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextTopicId ? (
            <button
              type="button"
              onClick={() => {
                narrator.stop()
                onSelectTopic(nextTopicId)
                setUserAnswers({})
                setSubmittedAnswers({})
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex items-center justify-end gap-3 rounded-2xl border border-border bg-card p-4 text-right transition-colors hover:bg-secondary"
            >
              <div>
                <span className="text-xs text-muted-foreground">{study.nextModule}</span>
                <p className="text-sm font-bold text-foreground">
                  {study.pages[nextTopicId].title}
                </p>
              </div>
              <ArrowRight className="size-5 text-primary" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                narrator.stop()
                onNavigate('public')
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <span>{study.backToHub}</span>
              <CheckCircle2 className="size-4" />
            </button>
          )}
        </div>
      </main>

      {/* ── Lightbox Modal for Zooming Any Inline Figure ───────────────────── */}
      <MediaLightbox
        isOpen={lightboxItem !== null}
        onClose={() => setLightboxItem(null)}
        item={lightboxItem}
      />

      {/* ── Proctored Anti-AI Mastery Exam Modal ────────────────────────────── */}
      {isExamModalOpen && (
        <MasteryExamModal
          condition="oa"
          topicId={topicId}
          topicTitle={page.title}
          milestones={milestones}
          onClose={() => setIsExamModalOpen(false)}
        />
      )}

      {/* ── Global Floating Audio Player Bar ─────────────────────────────────── */}
      <AudioPlayerBar />
    </div>
  )
}

function renderSectionVisual(
  topicId: StudyTopicId,
  sIdx: number,
  setLightboxItem: (item: LightboxItem) => void
) {
  if (topicId === 'know-oa') {
    if (sIdx === 0) {
      return (
        <div className="my-5 rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">
              Figure 1.1 &bull; Clinical Joint Anatomy Reference
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ZoomIn className="size-3.5" /> Tap image to zoom
            </span>
          </div>
          <div
            onClick={() =>
              setLightboxItem({
                src: '/media/osteoarthritis/photos/54bb29e85b8ca599001ac62e6d1bb14e.jpg',
                title: 'Knee Joint Anatomy & Cartilage Breakdown',
                caption:
                  'Complete anatomical map: hyaline articular cartilage, menisci shock absorbers, and supporting cruciate ligaments.',
                category: 'Joint Anatomy',
              })
            }
            className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-black/10 aspect-[16/9] relative"
          >
            <img
              src="/media/osteoarthritis/photos/54bb29e85b8ca599001ac62e6d1bb14e.jpg"
              alt="Knee Joint Anatomy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-md">
                Zoom Anatomy Map
              </span>
            </div>
          </div>
        </div>
      )
    }
    if (sIdx === 1) {
      return (
        <div className="my-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 sm:p-5">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block mb-3">
            Figure 1.2 &bull; 3D Simulation of Joint Degeneration
          </span>
          <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
            <video
              src="/media/osteoarthritis/videos/Osteoarthritis_Mechanics.mp4"
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            3D animation demonstrating articular cartilage breakdown, joint space narrowing, and subchondral bone sclerosis.
          </p>
        </div>
      )
    }
  }

  if (topicId === 'symptoms') {
    if (sIdx === 0) {
      return (
        <div className="my-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase">
              Figure 2.1 &bull; Clinical Diagnostic Differentiation
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ZoomIn className="size-3.5" /> Tap to zoom
            </span>
          </div>
          <div
            onClick={() =>
              setLightboxItem({
                src: '/media/osteoarthritis/photos/065b4c8f7d8922f7e6c1f771290279bc.jpg',
                title: 'Osteoarthritis (OA) vs Rheumatoid Arthritis (RA)',
                caption:
                  'Mechanical wear vs autoimmune systemic inflammation, duration of morning stiffness, and nodal deformities.',
                category: 'Diagnostics',
              })
            }
            className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-black/10 aspect-[16/9] relative"
          >
            <img
              src="/media/osteoarthritis/photos/065b4c8f7d8922f7e6c1f771290279bc.jpg"
              alt="OA vs RA Differential"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-md">
                Zoom Comparison Chart
              </span>
            </div>
          </div>
        </div>
      )
    }
  }

  if (topicId === 'diet') {
    if (sIdx === 0) {
      return (
        <div className="my-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
              Figure 3.1 &bull; Anti-Inflammatory Nutritional Matrix
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ZoomIn className="size-3.5" /> Tap to zoom
            </span>
          </div>
          <div
            onClick={() =>
              setLightboxItem({
                src: '/media/osteoarthritis/photos/3e6b18d109be3f206e965582f3fa800e.jpg',
                title: '10 Foods That Naturally Reduce Joint Inflammation',
                caption:
                  'Fatty fish, berries, olive oil, walnuts, turmeric, and cruciferous vegetables lowering CRP biomarkers.',
                category: 'Nutrition',
              })
            }
            className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-black/10 aspect-[16/9] relative"
          >
            <img
              src="/media/osteoarthritis/photos/3e6b18d109be3f206e965582f3fa800e.jpg"
              alt="10 Anti-inflammatory foods"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-md">
                Zoom Nutrition Guide
              </span>
            </div>
          </div>
        </div>
      )
    }
  }

  if (topicId === 'exercise') {
    if (sIdx === 0) {
      return (
        <div className="my-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 sm:p-5">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase block mb-3">
            Video Guide &bull; How Exercise Relieves Osteoarthritis Pain
          </span>
          <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
            <video
              src="/media/osteoarthritis/videos/How_Exercise_Relieves_Osteoarthritis_Pain.mp4"
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            The &quot;motion is lotion&quot; biological mechanism: how cyclic loading circulates synovial nutrients directly into cartilage cells.
          </p>
        </div>
      )
    }
    if (sIdx === 1) {
      return (
        <div className="my-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
              Figure 4.1 &bull; Senior Resistance &amp; Flexibility Protocol
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ZoomIn className="size-3.5" /> Tap to zoom
            </span>
          </div>
          <div
            onClick={() =>
              setLightboxItem({
                src: '/media/osteoarthritis/photos/40ed11189d2239fcd2bf5ccdc4f613ba.jpg',
                title: 'Resistance Band Strength & Mobility for Seniors',
                caption:
                  '16 gentle seated and standing exercises to stabilize knee, hip, and ankle joints safely.',
                category: 'Rehabilitation',
              })
            }
            className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-black/10 aspect-[16/9] relative"
          >
            <img
              src="/media/osteoarthritis/photos/40ed11189d2239fcd2bf5ccdc4f613ba.jpg"
              alt="Resistance band exercises"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-md">
                Zoom Exercise Routine
              </span>
            </div>
          </div>
        </div>
      )
    }
  }

  return null
}

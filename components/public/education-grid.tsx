'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Apple,
  Activity,
  HeartPulse,
  ChevronDown,
  Play,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Volume2,
  Pause,
  ZoomIn,
  Film,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Bone,
  Check,
  Eye,
  Award,
  Lock,
  QrCode,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { searchTopics } from '@/lib/api/education'
import { useTranslation, interpolate } from '@/lib/i18n/context'
import type { StudyTopicId } from '@/lib/data'
import { useSpeechNarrator } from '@/lib/tts/use-speech-narrator'
import { AudioPlayerBar } from '@/components/public/audio-player-bar'
import {
  CURATED_TOPIC_MEDIA,
  OSTEOPOROSIS_TOPICS,
  type MediaPhotoItem,
} from '@/lib/data/media-registry'
import { ClinicalVideoPlayer } from '@/components/public/clinical-video-player'
import { VisualGallery } from '@/components/public/visual-gallery'
import { MediaLightbox, type LightboxItem } from '@/components/public/media-lightbox'
import { useEngagementTracker } from '@/lib/training/use-engagement-tracker'
import { MasteryExamModal } from '@/components/training/mastery-exam'

const icons: Record<string, typeof BookOpen> = {
  'know-oa': BookOpen,
  symptoms: HeartPulse,
  diet: Apple,
  exercise: Activity,
  'know-osteoporosis': Bone,
  'osteoporosis-symptoms': HeartPulse,
  'osteoporosis-diet': Apple,
  'osteoporosis-exercise': Activity,
}

// Clinical takeaway points for balanced educational presentation
const TOPIC_CLINICAL_POINTS: Record<string, string[]> = {
  'know-oa': [
    'Hyaline cartilage lacks pain nerves; early cartilage loss happens quietly before severe symptoms.',
    'Cyclic joint compression pumps synovial fluid and essential nutrients directly into chondrocytes.',
    'Early lifestyle management and low-impact movement arrest mechanical cartilage wear.',
  ],
  symptoms: [
    'Morning joint stiffness lasting < 30 minutes is a classic differentiator favoring Osteoarthritis.',
    'Crepitus (grating or crackling sensation) signals loss of smooth hyaline cartilage cushions.',
    'Weight loss of just 1 kg reduces up to 4 kg of repetitive load on weight-bearing knee joints.',
  ],
  diet: [
    'Omega-3 fatty acids directly suppress systemic inflammatory cytokines in synovial fluids.',
    'Anthocyanins and polyphenols protect joint chondrocytes against cellular oxidative stress.',
    'A Mediterranean diet pattern significantly lowers CRP inflammatory biomarkers.',
  ],
  exercise: [
    'Quadriceps and hamstring strength absorbs over 40% of ground impact forces during walking.',
    'Low-impact swimming, cycling, and walking lubricate joint surfaces and prevent joint stiffness.',
    'Consistency over intensity: 20 minutes of daily gentle movement beats sporadic strenuous workouts.',
  ],
  'know-osteoporosis': [
    'Osteoporosis is a silent disease; bone thinning occurs painlessly until an accidental fracture.',
    'Bone remodeling is dynamic: osteoblasts build new bone while osteoclasts resorb old matrix.',
    'Peak bone density peaks around age 30; weight-bearing loading preserves mineral density.',
  ],
  'osteoporosis-symptoms': [
    'Progressive height loss (> 1 inch) or forward upper spine curvature indicates compression.',
    'DEXA T-score: Normal ≥ -1.0, Osteopenia between -1.0 and -2.5, Osteoporosis ≤ -2.5.',
    'Post-menopausal women and seniors over 60 should receive baseline bone densitometry.',
  ],
  'osteoporosis-diet': [
    'Adults over 50 require 1,200 mg of calcium and 800–1,000 IU of Vitamin D daily.',
    'Vitamin D is mandatory for intestinal calcium absorption and bone mineral deposition.',
    'Calcium-rich diet: fortified yogurt, dairy, dark leafy greens, almonds, and sesame seeds.',
  ],
  'osteoporosis-exercise': [
    'Dynamic mechanical bone loading stimulates osteoblasts to fortify trabecular bone.',
    'Fall prevention drills (balance, tandem stand, chair squats) dramatically cut hip fracture risk.',
    'Avoid high-impact spinal twisting; focus on upright posture and gentle resistance training.',
  ],
}

interface EducationGridProps {
  onSelectStudyTopic?: (id: StudyTopicId) => void
}

export function EducationGrid({ onSelectStudyTopic }: EducationGridProps) {
  const { t } = useTranslation()
  const narrator = useSpeechNarrator()
  const [activeCondition, setActiveCondition] = useState<'oa' | 'osteoporosis'>('oa')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('know-oa')
  const [query, setQuery] = useState('')
  const [lightboxItem, setLightboxItemRaw] = useState<LightboxItem | null>(null)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const { milestones, recordVisualZoom } = useEngagementTracker(
    activeCondition === 'oa' ? 'oa-education' : 'osteoporosis-education'
  )

  const setLightboxItem = (item: LightboxItem | null) => {
    if (item) {
      recordVisualZoom(item.src)
    }
    setLightboxItemRaw(item)
  }

  const audioDict = t.study.audioGuide

  // Active topic list based on condition switch
  const activeTopics = activeCondition === 'oa' ? t.education.topics : OSTEOPOROSIS_TOPICS

  // Semantic / keyword search
  const filtered = searchTopics(query, activeTopics)

  // Ensure current active topic belongs to current condition / filter
  const currentTopic =
    activeTopics.find((top) => top.id === selectedTopicId) ||
    filtered[0] ||
    activeTopics[0]

  const currentTopicIndex = activeTopics.findIndex((top) => top.id === currentTopic.id)
  const curatedMedia = CURATED_TOPIC_MEDIA[currentTopic.id as keyof typeof CURATED_TOPIC_MEDIA] || []
  const clinicalPoints = TOPIC_CLINICAL_POINTS[currentTopic.id] || []
  const isSpeakingCurrent = narrator.isPlaying && narrator.currentSectionId === currentTopic.id

  function handleListenTopic(
    e: React.MouseEvent,
    topic: { id: string; title: string; summary: string; content: string[] }
  ) {
    e.stopPropagation()
    const isThisPlaying = narrator.isPlaying && narrator.currentSectionId === topic.id
    if (isThisPlaying) {
      narrator.pause()
    } else if (narrator.isPaused && narrator.currentSectionId === topic.id) {
      narrator.resume()
    } else {
      narrator.speakSection({
        id: topic.id,
        title: topic.title,
        text: `${topic.title}. ${topic.summary}. ${topic.content.join(' ')}`,
      })
    }
  }

  function handleConditionChange(cond: 'oa' | 'osteoporosis') {
    setActiveCondition(cond)
    setSelectedTopicId(cond === 'oa' ? 'know-oa' : 'know-osteoporosis')
    setQuery('')
  }

  function handleSelectNext() {
    if (currentTopicIndex < activeTopics.length - 1) {
      setSelectedTopicId(activeTopics[currentTopicIndex + 1].id)
    }
  }

  function handleSelectPrev() {
    if (currentTopicIndex > 0) {
      setSelectedTopicId(activeTopics[currentTopicIndex - 1].id)
    }
  }

  const CurrentIcon = icons[currentTopic.id] ?? BookOpen

  return (
    <section id="education" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full bg-accent px-3.5 py-1 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
          {t.education.badge}
        </span>
        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t.education.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
          Comprehensive clinical education and visual guides. Toggle between Osteoarthritis (cartilage health) and Osteoporosis (bone density) below.
        </p>

        {/* ── Condition Switcher (OA vs Osteoporosis) ────────────────────── */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-card p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => handleConditionChange('oa')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm cursor-pointer ${
                activeCondition === 'oa'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Activity className="size-4" />
              <span>Osteoarthritis (OA)</span>
            </button>
            <button
              type="button"
              onClick={() => handleConditionChange('osteoporosis')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all sm:text-sm cursor-pointer ${
                activeCondition === 'osteoporosis'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Bone className="size-4" />
              <span>Osteoporosis</span>
            </button>
          </div>
        </div>

        {/* Semantic search box */}
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              const matches = searchTopics(e.target.value, activeTopics)
              if (matches.length > 0) {
                setSelectedTopicId(matches[0].id)
              }
            }}
            placeholder={
              activeCondition === 'oa'
                ? t.education.searchPlaceholder
                : 'Search bone density, DEXA, calcium, spine...'
            }
            className="w-full rounded-xl border border-border bg-card py-3 pr-10 pl-11 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            aria-label="Search education topics"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t.common.clearSearch}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {query && (
          <p className="mt-3 text-sm text-muted-foreground">
            {filtered.length > 0
              ? interpolate(t.education.resultsCount, { count: filtered.length, query })
              : interpolate(t.education.noResults, { query })}
          </p>
        )}
      </div>

      {/* ── 4-Module Selector Navigation Tabs ─────────────────────────────── */}
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {activeTopics.map((topic, index) => {
          const Icon = icons[topic.id] ?? BookOpen
          const isSelected = currentTopic.id === topic.id
          const mediaCount = (CURATED_TOPIC_MEDIA[topic.id as keyof typeof CURATED_TOPIC_MEDIA] || []).length
          const isSpeakingThis = narrator.isPlaying && narrator.currentSectionId === topic.id

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopicId(topic.id)}
              className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? activeCondition === 'oa'
                    ? 'border-teal-600 bg-teal-500/10 ring-2 ring-teal-500/25 shadow-sm'
                    : 'border-amber-600 bg-amber-500/10 ring-2 ring-amber-500/25 shadow-sm'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? activeCondition === 'oa'
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-600 text-white'
                      : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                </span>

                <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {mediaCount} Visuals
                </span>
              </div>

              <div className="mt-3">
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${
                    isSelected
                      ? activeCondition === 'oa'
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-amber-700 dark:text-amber-300'
                      : 'text-muted-foreground'
                  }`}
                >
                  Module 0{index + 1}
                </span>
                <h4 className="mt-0.5 font-serif text-sm font-bold text-foreground line-clamp-1">
                  {topic.title}
                </h4>
              </div>

              {isSpeakingThis && (
                <span className="absolute top-2 right-2 flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Balanced Interactive Module Stage (Left = Content, Right = Visuals) ── */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Stage Header Banner */}
        <div className="flex flex-col gap-4 border-b border-border bg-secondary/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-11 items-center justify-center rounded-2xl ${
                activeCondition === 'oa'
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              <CurrentIcon className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold tracking-wider uppercase ${
                    activeCondition === 'oa' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {currentTopic.tag}
                </span>
                <span className="text-xs text-muted-foreground">
                  &bull; Module 0{currentTopicIndex + 1} of {activeTopics.length}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {currentTopic.title}
              </h3>
            </div>
          </div>

          {/* Audio narration button in header */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {narrator.supported && (
              <button
                type="button"
                onClick={(e) => handleListenTopic(e, currentTopic)}
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isSpeakingCurrent
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm animate-pulse'
                    : 'border-border bg-background text-foreground hover:bg-secondary'
                }`}
                title={audioDict.listenTopic}
              >
                {isSpeakingCurrent ? (
                  <>
                    <Pause className="size-4" />
                    <span>{audioDict.pause}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-4 text-primary" />
                    <span>{audioDict.listenTopic}</span>
                  </>
                )}
              </button>
            )}

            {activeCondition === 'oa' && onSelectStudyTopic && (
              <button
                type="button"
                onClick={() => {
                  narrator.stop()
                  onSelectStudyTopic(currentTopic.id as StudyTopicId)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer"
              >
                <GraduationCap className="size-4" />
                <span className="hidden sm:inline">{t.study.startStudy}</span>
                <span className="sm:hidden">Study Guide</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Balanced Two-Column Main Stage Content ─────────────────────── */}
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10">
          {/* ── LEFT COLUMN (7 Cols): Clinical Knowledge & Takeaways ─────── */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
            <div className="space-y-5">
              {/* Lead Summary Callout Box */}
              <div
                className={`rounded-2xl border p-4.5 ${
                  activeCondition === 'oa'
                    ? 'border-teal-500/20 bg-teal-500/5 text-teal-950 dark:text-teal-100'
                    : 'border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-100'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Clinical Summary</span>
                </div>
                <p className="mt-1.5 text-sm font-medium leading-relaxed sm:text-base">
                  {currentTopic.summary}
                </p>
              </div>

              {/* Educational Text Paragraphs */}
              <div className="space-y-4 text-sm leading-relaxed text-foreground/85 sm:text-base">
                {currentTopic.content.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Key Clinical Takeaways Card */}
              {clinicalPoints.length > 0 && (
                <div className="rounded-2xl border border-border bg-secondary/30 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-foreground uppercase">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Key Clinical Takeaways</span>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {clinicalPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/80 sm:text-sm">
                        <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          <Check className="size-2.5" />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Stage Footer Navigation & Study CTA */}
            <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentTopicIndex === 0}
                  onClick={handleSelectPrev}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={currentTopicIndex >= activeTopics.length - 1}
                  onClick={handleSelectNext}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40 cursor-pointer"
                >
                  <span>Next Module</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>

              {activeCondition === 'oa' && onSelectStudyTopic && (
                <button
                  type="button"
                  onClick={() => {
                    narrator.stop()
                    onSelectStudyTopic(currentTopic.id as StudyTopicId)
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground cursor-pointer"
                >
                  <GraduationCap className="size-4" />
                  <span>Start Module Study Guide & Quiz</span>
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN (5 Cols): Curated Visual Atlas & Diagrams ───── */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <h4 className="font-serif text-sm font-bold text-foreground sm:text-base">
                  Clinical Visual Aids & Anatomy
                </h4>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Tap to Zoom
              </span>
            </div>

            {/* Curated Media List for this Active Module */}
            <div className="space-y-4">
              {curatedMedia.map((media, idx) => (
                <div
                  key={media.id || idx}
                  onClick={() =>
                    setLightboxItem({
                      src: media.src,
                      title: media.title,
                      caption: media.caption,
                      category: media.category,
                    })
                  }
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40">
                    <img
                      src={media.src}
                      alt={media.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-sm">
                        <ZoomIn className="size-4" /> Zoom High-Res
                      </span>
                    </div>

                    <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                      {media.category}
                    </span>
                  </div>

                  <div className="p-3.5">
                    <h5 className="font-serif text-xs font-bold text-foreground transition-colors group-hover:text-primary sm:text-sm">
                      {media.title}
                    </h5>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {media.caption}
                    </p>
                  </div>
                </div>
              ))}

              {/* Video Quick Link for Osteoarthritis */}
              {activeCondition === 'oa' && (
                <a
                  href="#clinical-video-theater"
                  className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-xs transition-colors hover:bg-primary/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Film className="size-4 text-primary" />
                    <div>
                      <p className="font-bold text-foreground">3D Clinical Video Demonstrations</p>
                      <p className="text-[11px] text-muted-foreground">Watch biomechanics & joint relief</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-primary" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── National Clinical Training & Blockchain Credential Program ────── */}
      <div className="mt-14 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-primary/5 to-card p-6 sm:p-10 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Award className="size-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Blockchain-Verified Clinical Credential &bull; SWASTIK Health Chain
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {activeCondition === 'oa'
                ? 'Osteoarthritis Clinical Mastery & Literacy Credential'
                : 'Osteoporosis Bone Density & DEXA Literacy Credential'}
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Complete accredited training on joint cartilage mechanics or bone mineral density, pass the anti-AI proctored clinical examination (80% honors threshold), and generate an immutable, tamper-proof credential anchored with Merkle proofs, QR verification, and 300 DPI PDF download.
            </p>

            {/* Anti-Cheat Safeguards badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Anti-Skip Engagement Gating
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
                <Clock className="size-3.5 text-primary" />
                45s Timed Vignettes
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
                <Lock className="size-3.5 text-amber-600" />
                Anti-Chatbot Tab Proctor
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1">
                <QrCode className="size-3.5 text-purple-600" />
                On-Chain Merkle Proof
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsExamModalOpen(true)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold shadow-md transition-all cursor-pointer ${
                milestones.isEligible
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25 animate-pulse'
                  : 'bg-primary/90 text-primary-foreground hover:bg-primary'
              }`}
            >
              <Award className="size-5" />
              <span>
                {milestones.isEligible
                  ? `Take Proctored ${activeCondition === 'oa' ? 'OA' : 'Osteoporosis'} Exam`
                  : `Start Training & Certification Exam`}
              </span>
            </button>

            <a
              href="/verify-certificate"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <QrCode className="size-3.5" />
              <span>Verify Any Certificate On-Chain</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Featured Clinical Video Theater ─────────────────────────────── */}
      <div id="clinical-video-theater" className="mt-20">
        <ClinicalVideoPlayer />
      </div>

      {/* ── Complete Clinical Visual Atlas & Image Gallery ───────────────── */}
      <div className="mt-8">
        <VisualGallery />
      </div>

      {/* Lightbox for zooming any clicked topic image */}
      <MediaLightbox
        isOpen={lightboxItem !== null}
        onClose={() => setLightboxItem(null)}
        item={lightboxItem}
      />

      {/* ── Proctored Anti-AI Mastery Exam Modal ────────────────────────── */}
      {isExamModalOpen && (
        <MasteryExamModal
          condition={activeCondition}
          topicId={currentTopic.id}
          topicTitle={currentTopic.title}
          milestones={milestones}
          onClose={() => setIsExamModalOpen(false)}
        />
      )}

      {/* Floating audio bar for public education topics */}
      <AudioPlayerBar />
    </section>
  )
}

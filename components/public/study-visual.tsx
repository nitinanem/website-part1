'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  ZoomIn,
  X,
  Sparkles,
  Info,
  CheckCircle2,
  Activity,
  HeartPulse,
  Apple,
  BookOpen,
  Maximize2,
  Film
} from 'lucide-react'
import type { StudyTopicId } from '@/lib/data'
import { useTranslation } from '@/lib/i18n/context'
import { getVisualsDict, type VisualsDictionary } from '@/lib/i18n/visuals-dict'
import { CURATED_TOPIC_MEDIA } from '@/lib/data/media-registry'
import { MediaLightbox, type LightboxItem } from '@/components/public/media-lightbox'

interface StudyVisualProps {
  topicId: StudyTopicId
  customImageUrl?: string
  customImageAlt?: string
  caption?: string
}

export function StudyVisual({
  topicId,
  customImageUrl,
  customImageAlt,
  caption,
}: StudyVisualProps) {
  const { t, language } = useTranslation()
  const vDict = getVisualsDict(language)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'photos' | 'schematic'>('photos')

  const curatedPhotos = CURATED_TOPIC_MEDIA[topicId] || []
  const activeLightboxItem: LightboxItem | null =
    selectedPhotoIndex !== null && curatedPhotos[selectedPhotoIndex]
      ? {
          src: curatedPhotos[selectedPhotoIndex].src,
          title: curatedPhotos[selectedPhotoIndex].title,
          caption: curatedPhotos[selectedPhotoIndex].caption,
          category: curatedPhotos[selectedPhotoIndex].category,
        }
      : null

  return (
    <>
      <div className="my-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="size-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Clinical Visual References &amp; Guides
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'photos' ? 'schematic' : 'photos')}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {viewMode === 'photos' ? 'Show Schematic View' : 'Show Clinical Photos'}
            </button>
            {curatedPhotos.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(0)}
                className="flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
              >
                <Maximize2 className="size-3.5" />
                <span>Zoom Diagrams</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Content */}
        <div className="p-4 sm:p-6">
          {customImageUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary/20">
              <img
                src={customImageUrl}
                alt={customImageAlt || 'Clinical guide illustration'}
                className="h-full w-full object-cover"
              />
            </div>
          ) : viewMode === 'photos' && curatedPhotos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {curatedPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-muted/20 shadow-xs transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-900 shadow-md">
                        <ZoomIn className="size-4" /> Tap to expand
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-serif text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {photo.title}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DiagramContainer topicId={topicId} dict={vDict} />
          )}

          {/* Caption */}
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border/60 bg-secondary/30 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              {caption || vDict.captions[topicId]}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <MediaLightbox
        isOpen={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
        item={activeLightboxItem}
        hasPrev={selectedPhotoIndex !== null && selectedPhotoIndex > 0}
        hasNext={selectedPhotoIndex !== null && selectedPhotoIndex < curatedPhotos.length - 1}
        onPrev={() => setSelectedPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        onNext={() =>
          setSelectedPhotoIndex((prev) =>
            prev !== null && prev < curatedPhotos.length - 1 ? prev + 1 : prev
          )
        }
      />
    </>
  )
}

function DiagramContainer({
  topicId,
  dict,
  expanded = false,
}: {
  topicId: StudyTopicId
  dict: VisualsDictionary
  expanded?: boolean
}) {
  switch (topicId) {
    case 'know-oa':
      return <KnowOADiagram dict={dict} expanded={expanded} />
    case 'symptoms':
      return <SymptomsDiagram dict={dict} expanded={expanded} />
    case 'diet':
      return <DietDiagram dict={dict} expanded={expanded} />
    case 'exercise':
      return <ExerciseDiagram dict={dict} expanded={expanded} />
  }
}

/** 1. Know OA: Joint Anatomy & Cartilage Breakdown */
function KnowOADiagram({ dict, expanded }: { dict: VisualsDictionary; expanded?: boolean }) {
  const k = dict.knowOa
  return (
    <div className={`grid gap-4 ${expanded ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 text-center">
        <span className="inline-block rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
          {k.stage0Title}
        </span>
        <div className="my-3 flex h-24 items-center justify-center rounded-lg bg-background border border-border">
          <div className="flex flex-col items-center">
            <div className="h-4 w-16 rounded-t-md bg-teal-500/40 border border-teal-500/60" />
            <div className="h-1 w-20 bg-teal-400/80 my-1 rounded-full shadow-xs" title="Smooth Synovial Fluid" />
            <div className="h-4 w-16 rounded-b-md bg-teal-500/40 border border-teal-500/60" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{k.stage0Desc}</p>
      </div>

      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
        <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {k.stage1Title}
        </span>
        <div className="my-3 flex h-24 items-center justify-center rounded-lg bg-background border border-border">
          <div className="flex flex-col items-center">
            <div className="h-4 w-16 rounded-t-md bg-emerald-500/40 border border-emerald-500/60 border-dashed" />
            <div className="h-1 w-16 bg-emerald-400/80 my-1 rounded-full" />
            <div className="h-4 w-16 rounded-b-md bg-emerald-500/40 border border-emerald-500/60" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{k.stage1Desc}</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
        <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          {k.stage2Title}
        </span>
        <div className="my-3 flex h-24 items-center justify-center rounded-lg bg-background border border-border">
          <div className="flex flex-col items-center">
            <div className="h-3.5 w-16 rounded-t-md bg-amber-500/40 border border-amber-500/60" />
            <div className="h-0.5 w-14 bg-amber-400/80 my-0.5 rounded-full" />
            <div className="h-3.5 w-16 rounded-b-md bg-amber-500/40 border border-amber-500/60" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{k.stage2Desc}</p>
      </div>

      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-center">
        <span className="inline-block rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
          {k.stage34Title}
        </span>
        <div className="my-3 flex h-24 items-center justify-center rounded-lg bg-background border border-border">
          <div className="flex flex-col items-center">
            <div className="h-3 w-16 rounded-t-md bg-rose-500/40 border border-rose-600" />
            <div className="h-0.5 w-8 bg-rose-500 my-0.5" />
            <div className="h-3 w-16 rounded-b-md bg-rose-500/40 border border-rose-600" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{k.stage34Desc}</p>
      </div>
    </div>
  )
}

/** 2. Symptoms: Mechanical vs Inflammatory */
function SymptomsDiagram({ dict, expanded }: { dict: VisualsDictionary; expanded?: boolean }) {
  const s = dict.symptoms
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex size-6 items-center justify-center rounded-md bg-rose-500/20 text-rose-600 font-bold text-xs">
            OA
          </span>
          <h4 className="font-semibold text-sm text-foreground">{s.mechanicalTitle}</h4>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-rose-500" />
            <strong>{s.morningStiffnessLabel}:</strong> {s.mechanicalStiffness}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-rose-500" />
            <strong>{s.activityPatternLabel}:</strong> {s.mechanicalActivity}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-rose-500" />
            <strong>{s.physicalSignsLabel}:</strong> {s.mechanicalSigns}
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex size-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-600 font-bold text-xs">
            {s.raBadge}
          </span>
          <h4 className="font-semibold text-sm text-foreground">{s.raTitle}</h4>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <strong>{s.morningStiffnessLabel}:</strong> {s.raStiffness}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <strong>{s.activityPatternLabel}:</strong> {s.raActivity}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <strong>{s.physicalSignsLabel}:</strong> {s.raSigns}
          </li>
        </ul>
      </div>
    </div>
  )
}

/** 3. Diet: Anti-inflammatory & Mechanical Load */
function DietDiagram({ dict, expanded }: { dict: VisualsDictionary; expanded?: boolean }) {
  const d = dict.diet
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
        <span className="text-2xl">🫒 🥑</span>
        <h4 className="mt-2 text-sm font-semibold text-foreground">{d.oliveTitle}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{d.oliveDesc}</p>
      </div>

      <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 text-center">
        <span className="text-2xl">🥦 🥬</span>
        <h4 className="mt-2 text-sm font-semibold text-foreground">{d.sulforaphaneTitle}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{d.sulforaphaneDesc}</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
        <span className="text-2xl">⚖️ 📉</span>
        <h4 className="mt-2 text-sm font-semibold text-foreground">{d.ratioTitle}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{d.ratioDesc}</p>
      </div>
    </div>
  )
}

/** 4. Exercise: 3 Pillars & 24-Hour Pain Rule */
function ExerciseDiagram({ dict, expanded }: { dict: VisualsDictionary; expanded?: boolean }) {
  const e = dict.exercise
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase mb-1">
            <Activity className="size-3.5" /> {e.pillar1Title}
          </div>
          <p className="text-xs text-muted-foreground">{e.pillar1Desc}</p>
        </div>

        <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4">
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs uppercase mb-1">
            <HeartPulse className="size-3.5" /> {e.pillar2Title}
          </div>
          <p className="text-xs text-muted-foreground">{e.pillar2Desc}</p>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase mb-1">
            <Sparkles className="size-3.5" /> {e.pillar3Title}
          </div>
          <p className="text-xs text-muted-foreground">{e.pillar3Desc}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground">
          <span>{e.painRuleTitle}</span>
          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-bold">
            {e.protocolBadge}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
          <div className="rounded-lg bg-background p-2.5 border border-border">
            <strong className="text-emerald-600 block mb-1">{e.rule1Title}</strong>
            {e.rule1Desc}
          </div>
          <div className="rounded-lg bg-background p-2.5 border border-border">
            <strong className="text-amber-600 block mb-1">{e.rule2Title}</strong>
            {e.rule2Desc}
          </div>
          <div className="rounded-lg bg-background p-2.5 border border-border">
            <strong className="text-rose-600 block mb-1">{e.rule3Title}</strong>
            {e.rule3Desc}
          </div>
        </div>
      </div>
    </div>
  )
}

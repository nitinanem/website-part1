'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Sparkles, BookOpen, X } from 'lucide-react'

export interface ClinicalDefinition {
  term: string
  plainEnglish: string
  detail: string
  clinicalSignificance: string
}

export const CLINICAL_DICTIONARY: Record<string, ClinicalDefinition> = {
  'subchondral sclerosis': {
    term: 'Subchondral Sclerosis',
    plainEnglish: 'Bone thickening from friction',
    detail: 'Bone beneath the joint cartilage hardens and thickens as a defense mechanism against increased mechanical stress and cartilage wear.',
    clinicalSignificance: 'Common hallmark of progressive osteoarthritis; indicates cartilage thinning.',
  },
  'osteophytes': {
    term: 'Osteophytes (Bone Spurs)',
    plainEnglish: 'Small, natural bone spurs',
    detail: 'Smooth bony outgrowths that develop around the edges of arthritic joints as the body attempts to widen the surface area to distribute load.',
    clinicalSignificance: 'One of the key radiographic criteria used in Kellgren-Lawrence (KL) grading.',
  },
  'joint space narrowing': {
    term: 'Joint Space Narrowing (JSN)',
    plainEnglish: 'Thinning cartilage cushion',
    detail: 'A visible reduction in the gap between the femur and tibia (or hip bones), representing progressive loss or breakdown of the articular cartilage layer.',
    clinicalSignificance: 'Direct indicator of cartilage loss; graded from mild to complete bone-on-bone contact.',
  },
  'subchondral cysts': {
    term: 'Subchondral Cysts (Geodes)',
    plainEnglish: 'Fluid-filled pockets inside bone',
    detail: 'Small, fluid-filled cystic cavities that form in the bone beneath damaged cartilage due to synovial fluid pressure intrusions.',
    clinicalSignificance: 'Typically observed in moderate to advanced osteoarthritis.',
  },
  'kellgren-lawrence grade': {
    term: 'Kellgren–Lawrence (KL) Grade',
    plainEnglish: '0–4 OA severity rating',
    detail: 'A world-standard radiographic classification scale: Grade 0 (None), Grade 1 (Doubtful), Grade 2 (Minimal / definite osteophytes), Grade 3 (Moderate / joint space narrowing), Grade 4 (Severe / bone-on-bone).',
    clinicalSignificance: 'Standard diagnostic metric used by orthopedic specialists worldwide.',
  },
  'varus alignment': {
    term: 'Varus Alignment',
    plainEnglish: 'Bow-legged knee angle',
    detail: 'Inward angling of the knee joint placing excess mechanical load on the inner (medial) knee compartment.',
    clinicalSignificance: 'Increases medial compartment osteoarthritis progression risk.',
  },
  'valgus alignment': {
    term: 'Valgus Alignment',
    plainEnglish: 'Knock-kneed joint angle',
    detail: 'Outward angling of the knee joint shifting excess weight onto the lateral (outer) knee compartment.',
    clinicalSignificance: 'Increases lateral compartment stress.',
  },
  'chondromalacia': {
    term: 'Chondromalacia',
    plainEnglish: 'Softening of cartilage',
    detail: 'Softening, irritation, and micro-fissuring of the articular cartilage, commonly affecting the back surface of the patella (kneecap).',
    clinicalSignificance: 'Early pre-osteoarthritic or focal cartilage wear stage.',
  },
}

interface ClinicalTooltipProps {
  termKey: keyof typeof CLINICAL_DICTIONARY | string
  children?: React.ReactNode
  showIcon?: boolean
  className?: string
}

export function ClinicalTooltip({
  termKey,
  children,
  showIcon = true,
  className = '',
}: ClinicalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const normalizedKey = termKey.toLowerCase().trim()
  const definition = CLINICAL_DICTIONARY[normalizedKey] || {
    term: termKey,
    plainEnglish: 'Clinical terminology',
    detail: 'A medical term used in joint health and musculoskeletal evaluations.',
    clinicalSignificance: 'Provides diagnostic context for clinicians.',
  }

  const tooltipRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <span ref={tooltipRef} className={`relative inline-flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        onMouseEnter={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 border-b border-dashed border-primary/60 text-foreground font-semibold hover:text-primary transition-colors cursor-help"
        aria-label={`Learn what ${definition.term} means`}
      >
        <span>{children || definition.term}</span>
        {showIcon && (
          <span className="flex size-3.5 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Info className="size-2.5" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 sm:w-80 rounded-2xl border border-border bg-popover p-4 shadow-xl text-left"
            role="tooltip"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Plain-Language Guide
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close glossary popup"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Term & Meaning */}
            <div className="mt-2.5">
              <h4 className="font-serif text-sm font-bold text-popover-foreground">
                {definition.term}
              </h4>
              <p className="mt-0.5 text-xs font-semibold text-primary">
                = {definition.plainEnglish}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {definition.detail}
              </p>
            </div>

            {/* Clinical significance note */}
            <div className="mt-3 rounded-xl bg-secondary/60 p-2.5 border border-border/50">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <BookOpen className="size-3 text-primary" />
                <span>Clinical Relevance</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {definition.clinicalSignificance}
              </p>
            </div>

            {/* Arrow pointer */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

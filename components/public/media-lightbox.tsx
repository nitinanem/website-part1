'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react'

export interface LightboxItem {
  src: string
  title: string
  caption?: string
  category?: string
  condition?: string
}

interface MediaLightboxProps {
  isOpen: boolean
  onClose: () => void
  item: LightboxItem | null
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export function MediaLightbox({
  isOpen,
  onClose,
  item,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: MediaLightboxProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext])

  if (!isOpen || !item) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              {item.category && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase">
                  {item.category}
                </span>
              )}
              <h3 className="font-serif text-base font-semibold text-foreground sm:text-lg line-clamp-1">
                {item.title}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={item.src}
                target="_blank"
                rel="noreferrer"
                download
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Open image in full tab"
              >
                <Download className="size-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Image Canvas with Nav buttons */}
          <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-black/40 p-4">
            <img
              src={item.src}
              alt={item.title}
              className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
            />

            {hasPrev && onPrev && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPrev()
                }}
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-black/80 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {hasNext && onNext && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onNext()
                }}
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur hover:bg-black/80 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

          {/* Caption footer */}
          {item.caption && (
            <div className="border-t border-border/80 bg-secondary/30 px-4 py-3 sm:px-6">
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {item.caption}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

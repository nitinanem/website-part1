'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  Gauge
} from 'lucide-react'
import { useSpeechNarrator } from '@/lib/tts/use-speech-narrator'
import { useTranslation } from '@/lib/i18n/context'

export function AudioPlayerBar() {
  const { t } = useTranslation()
  const narrator = useSpeechNarrator()
  const audioDict = t.study.audioGuide

  if (!narrator.supported || narrator.isIdle) {
    return null
  }

  const speedOptions = [0.8, 1.0, 1.2]
  const currentSpeed = narrator.rate

  function handleSpeedCycle() {
    const nextIdx = (speedOptions.indexOf(currentSpeed) + 1) % speedOptions.length
    narrator.setRate(speedOptions[nextIdx] || 1.0)
  }

  const progressPercent =
    narrator.totalSections > 0
      ? Math.round(((narrator.currentSectionIndex + 1) / narrator.totalSections) * 100)
      : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 inset-x-4 mx-auto max-w-2xl z-50 pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl p-4 sm:p-5 text-foreground">
          {/* Top subtle progress line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-secondary">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {/* Upper row: Section info and sound equalizer */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Animated sound equalizer */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  {narrator.isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4">
                      <motion.span
                        animate={{ height: ['40%', '100%', '30%'] }}
                        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                        className="w-1 bg-primary-foreground rounded-full"
                      />
                      <motion.span
                        animate={{ height: ['80%', '20%', '90%'] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.1, ease: 'easeInOut' }}
                        className="w-1 bg-primary-foreground rounded-full"
                      />
                      <motion.span
                        animate={{ height: ['30%', '90%', '40%'] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: 0.2, ease: 'easeInOut' }}
                        className="w-1 bg-primary-foreground rounded-full"
                      />
                    </div>
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {narrator.isPlaying ? audioDict.playingAudio : audioDict.audioPaused}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({narrator.currentSectionIndex + 1}/{narrator.totalSections})
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">
                    {narrator.currentSectionTitle || audioDict.readingSection}
                  </p>
                </div>
              </div>

              {/* Dismiss / Stop button */}
              <button
                type="button"
                onClick={narrator.stop}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title={audioDict.stop}
                aria-label={audioDict.stop}
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Bottom row: Playback Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
              {/* Left: Speed selector button */}
              <button
                type="button"
                onClick={handleSpeedCycle}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                title={`${audioDict.speed}: ${currentSpeed}x`}
              >
                <Gauge className="size-3.5 text-muted-foreground" />
                <span>{currentSpeed}x</span>
              </button>

              {/* Center: Main controls (Prev, Play/Pause, Next) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={narrator.prev}
                  disabled={narrator.currentSectionIndex === 0}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous section"
                >
                  <SkipBack className="size-4" />
                </button>

                {narrator.isPlaying ? (
                  <button
                    type="button"
                    onClick={narrator.pause}
                    className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                    aria-label={audioDict.pause}
                  >
                    <Pause className="size-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={narrator.resume}
                    className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                    aria-label={audioDict.resume}
                  >
                    <Play className="size-5 ml-0.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={narrator.next}
                  disabled={narrator.currentSectionIndex >= narrator.totalSections - 1}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next section"
                >
                  <SkipForward className="size-4" />
                </button>
              </div>

              {/* Right: Stop button */}
              <button
                type="button"
                onClick={narrator.stop}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                <span>{audioDict.stop}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

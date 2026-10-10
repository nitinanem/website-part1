'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, CheckCircle2, Film } from 'lucide-react'
import { CLINICAL_VIDEOS, type VideoItem } from '@/lib/data/media-registry'

interface ClinicalVideoPlayerProps {
  initialVideoId?: string
  className?: string
  autoPlay?: boolean
}

export function ClinicalVideoPlayer({
  initialVideoId = 'oa-mechanics',
  className = '',
}: ClinicalVideoPlayerProps) {
  const [activeVideoId, setActiveVideoId] = useState(initialVideoId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const activeVideo: VideoItem =
    CLINICAL_VIDEOS.find((v) => v.id === activeVideoId) ?? CLINICAL_VIDEOS[0]

  function handleSelectVideo(id: string) {
    setActiveVideoId(id)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  function togglePlay() {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((e) => {
        console.warn('Playback error:', e)
      })
    }
  }

  function toggleMute() {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  function handleSpeedChange() {
    if (!videoRef.current) return
    const rates = [1, 1.25, 1.5, 0.75]
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIdx]
    videoRef.current.playbackRate = nextRate
    setPlaybackRate(nextRate)
  }

  function handleFullscreen() {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-border bg-card shadow-xl transition-all ${className}`}>
      {/* Top Header / Video Switcher */}
      <div className="border-b border-border bg-secondary/40 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Film className="size-5" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Clinical Video Theater
              </span>
              <h3 className="font-serif text-lg font-bold text-foreground sm:text-xl">
                {activeVideo.title}
              </h3>
            </div>
          </div>

          <span className="self-start rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:self-center">
            {activeVideo.badge} &bull; {activeVideo.duration}
          </span>
        </div>

        {/* Video selector tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CLINICAL_VIDEOS.map((vid, idx) => {
            const isSelected = vid.id === activeVideoId
            return (
              <button
                key={vid.id}
                type="button"
                onClick={() => handleSelectVideo(vid.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                  0{idx + 1}
                </span>
                <span>{vid.title.split('—')[0].split('&')[0].trim()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Video & Takeaways Area */}
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:items-center">
        {/* HTML5 Video Player Container */}
        <div className="relative overflow-hidden rounded-2xl bg-black shadow-inner lg:col-span-7">
          <video
            ref={videoRef}
            src={activeVideo.src}
            className="w-full aspect-video object-contain"
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Overlay Big Play Button if paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all hover:bg-black/25"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform"
                aria-label="Play video"
              >
                <Play className="ml-1 size-7 fill-current" />
              </motion.button>
            </div>
          )}

          {/* Bottom Floating Control Bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/50 to-transparent p-3 text-white">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="flex size-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="flex size-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSpeedChange}
                className="rounded-lg bg-white/20 px-2 py-1 text-[11px] font-bold hover:bg-white/30 transition-colors"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="flex size-8 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Fullscreen"
              >
                <Maximize className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Clinical Context & Takeaways */}
        <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
          <div>
            <span className="text-xs font-semibold text-primary uppercase">
              {activeVideo.subtitle}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {activeVideo.description}
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <CheckCircle2 className="size-4" />
              Key Clinical Takeaways:
            </h4>
            <ul className="mt-3 space-y-2.5">
              {activeVideo.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/85 leading-relaxed">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

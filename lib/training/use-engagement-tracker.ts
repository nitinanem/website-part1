'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface EngagementMilestones {
  activeSeconds: number
  requiredSeconds: number
  visualsZoomedCount: number
  requiredVisuals: number
  sectionsViewedCount: number
  requiredSections: number
  videoProgressPercent: number
  isEligible: boolean
  progressPercent: number
}

const REQUIRED_SECONDS = 45 // Minimum active engagement seconds
const REQUIRED_VISUALS = 1 // Minimum clinical figures zoomed/inspected
const REQUIRED_SECTIONS = 2 // Minimum sections scrolled into view

export function useEngagementTracker(topicId: string) {
  const [activeSeconds, setActiveSeconds] = useState(0)
  const [visualsZoomed, setVisualsZoomed] = useState<Set<string>>(new Set())
  const [sectionsViewed, setSectionsViewed] = useState<Set<string>>(new Set())
  const [videoProgress, setVideoProgress] = useState(0)

  const lastActivityRef = useRef<number>(Date.now())
  const isDocumentVisibleRef = useRef<boolean>(true)

  // Listen for user activity to ensure active presence (not idle)
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const handleVisibility = () => {
      isDocumentVisibleRef.current = !document.hidden
      if (!document.hidden) {
        lastActivityRef.current = Date.now()
      }
    }

    window.addEventListener('mousemove', handleActivity, { passive: true })
    window.addEventListener('scroll', handleActivity, { passive: true })
    window.addEventListener('keydown', handleActivity, { passive: true })
    window.addEventListener('touchstart', handleActivity, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    // Accumulate active time only when user is genuinely active (within 20s of last event)
    const interval = setInterval(() => {
      const now = Date.now()
      const isRecentlyActive = now - lastActivityRef.current < 20000
      if (isDocumentVisibleRef.current && isRecentlyActive) {
        setActiveSeconds((prev) => prev + 1)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [topicId])

  // Track visual zoom
  const recordVisualZoom = useCallback((visualId: string) => {
    setVisualsZoomed((prev) => new Set(prev).add(visualId))
  }, [])

  // Track section viewed
  const recordSectionView = useCallback((sectionId: string) => {
    setSectionsViewed((prev) => new Set(prev).add(sectionId))
  }, [])

  // Track video progress
  const recordVideoProgress = useCallback((percent: number) => {
    setVideoProgress((prev) => Math.max(prev, percent))
  }, [])

  // Calculate milestones
  const timeProgress = Math.min(100, (activeSeconds / REQUIRED_SECONDS) * 100)
  const visualProgress = Math.min(100, (visualsZoomed.size / REQUIRED_VISUALS) * 100)
  const sectionProgress = Math.min(100, (sectionsViewed.size / REQUIRED_SECTIONS) * 100)

  const overallProgress = Math.round((timeProgress * 0.5) + (visualProgress * 0.25) + (sectionProgress * 0.25))

  const isEligible =
    activeSeconds >= REQUIRED_SECONDS &&
    visualsZoomed.size >= REQUIRED_VISUALS &&
    sectionsViewed.size >= REQUIRED_SECTIONS

  return {
    milestones: {
      activeSeconds,
      requiredSeconds: REQUIRED_SECONDS,
      visualsZoomedCount: visualsZoomed.size,
      requiredVisuals: REQUIRED_VISUALS,
      sectionsViewedCount: sectionsViewed.size,
      requiredSections: REQUIRED_SECTIONS,
      videoProgressPercent: videoProgress,
      isEligible,
      progressPercent: overallProgress,
    },
    recordVisualZoom,
    recordSectionView,
    recordVideoProgress,
  }
}

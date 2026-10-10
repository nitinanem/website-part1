'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  speechNarrator,
  type NarratorSection,
  type NarratorState,
  type PlaybackStatus,
} from './speech-narrator'
import { useTranslation } from '@/lib/i18n/context'

export function useSpeechNarrator() {
  const { language } = useTranslation()
  // Ensure that on SSR and during initial client-side hydration, state matches identically.
  // speechNarrator.getState() returns supported: false on server, but supported: true in browser window.
  // Initializing with supported: false guarantees zero hydration mismatches across components.
  const [state, setState] = useState<NarratorState>(() => ({
    ...speechNarrator.getState(),
    supported: false,
  }))

  useEffect(() => {
    // Only after client mount / hydration, populate actual browser capabilities
    setState(speechNarrator.getState())
    const unsubscribe = speechNarrator.subscribe((newState) => {
      setState(newState)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const speak = useCallback(
    (sections: NarratorSection[], startIndex = 0) => {
      speechNarrator.speak(sections, { lang: language, startIndex, rate: state.rate })
    },
    [language, state.rate]
  )

  const speakSection = useCallback(
    (section: NarratorSection) => {
      speechNarrator.speakSingle(section, { lang: language, rate: state.rate })
    },
    [language, state.rate]
  )

  const pause = useCallback(() => {
    speechNarrator.pause()
  }, [])

  const resume = useCallback(() => {
    speechNarrator.resume()
  }, [])

  const stop = useCallback(() => {
    speechNarrator.stop()
  }, [])

  const next = useCallback(() => {
    speechNarrator.nextSection()
  }, [])

  const prev = useCallback(() => {
    speechNarrator.prevSection()
  }, [])

  const setRate = useCallback((rate: number) => {
    speechNarrator.setRate(rate)
  }, [])

  const jumpTo = useCallback((index: number) => {
    speechNarrator.jumpToSection(index)
  }, [])

  return {
    ...state,
    speak,
    speakSection,
    pause,
    resume,
    stop,
    next,
    prev,
    setRate,
    jumpTo,
    isPlaying: state.status === 'playing',
    isPaused: state.status === 'paused',
    isIdle: state.status === 'idle',
  }
}

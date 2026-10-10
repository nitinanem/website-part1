'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { Dictionary } from './types'
import { en } from './en'
import { hi } from './hi'
import { pa } from './pa'
import { bn } from './bn'
import { as as as_ } from './as'

// ── Language type ──────────────────────────────────────────────────────────────
// Extends the original 'en'|'hi'|'pa' to add 'bn' (Bengali / Tripura) and
// 'as' (Assamese / Assam), both official NER languages in the problem scope.
export type Language = 'en' | 'hi' | 'pa' | 'bn' | 'as'

export const languageLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  pa: 'ਪੰਜਾਬੀ',
  bn: 'বাংলা',
  as: 'অসমীয়া',
}

const dictionaries: Record<Language, Dictionary> = { en, hi, pa, bn, as: as_ }

const STORAGE_KEY = 'jc_language'

// ── Context shape ──────────────────────────────────────────────────────────────
interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Hydrate from localStorage once on mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored && stored in dictionaries) {
        setLanguageState(stored)
      }
    } catch {
      // localStorage may not be available in all environments
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [])

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: dictionaries[language],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────────
/**
 * Returns `{ t, language, setLanguage }` from the nearest LanguageProvider.
 *
 * `t` is the full typed Dictionary for the current locale — call any nested
 * key directly: `t.common.save`, `t.journal.locations`, etc.
 *
 * Template strings that contain `{placeholder}` tokens (e.g. `t.wizard.stepSubtitle`)
 * are replaced with the helper: `interpolate(t.wizard.stepSubtitle, { step: 1, total: 4 })`.
 */
export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: dictionaries.en,
    }
  }
  return ctx
}

// ── Template interpolation helper ──────────────────────────────────────────────
/**
 * Replaces `{key}` tokens in a string with the corresponding value.
 *
 * @example
 * interpolate(t.wizard.stepSubtitle, { step: 2, total: 4 })
 * // → "Step 2 of 4 · Your progress is saved automatically."
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce<string>(
    (str, [key, val]) => str.replaceAll(`{${key}}`, String(val)),
    template,
  )
}

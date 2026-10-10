'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation, type Language } from '@/lib/i18n/context'

// Each language: native script name + Latin subtitle so elderly users can identify it
const LANG_META: Record<Language, { native: string; subtitle: string }> = {
  en: { native: 'English',   subtitle: 'English' },
  hi: { native: 'हिंदी',     subtitle: 'Hindi' },
  pa: { native: 'ਪੰਜਾਬੀ',   subtitle: 'Punjabi' },
  bn: { native: 'বাংলা',     subtitle: 'Bengali' },
  as: { native: 'অসমীয়া',  subtitle: 'Assamese' },
}

/**
 * A large, tap-friendly language picker for elderly patients.
 * No flags — just big bold text with a clear active indicator.
 *
 * @param onPick  Optional callback fired after the language is changed.
 */
export function LanguagePicker({ onPick }: { onPick?: (lang: Language) => void } = {}) {
  const { language, setLanguage } = useTranslation()

  function handleSelect(lang: Language) {
    setLanguage(lang)
    onPick?.(lang)
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Select language">
      {(Object.keys(LANG_META) as Language[]).map((lang) => {
        const meta = LANG_META[lang]
        const active = language === lang

        return (
          <motion.button
            key={lang}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => handleSelect(lang)}
            whileTap={{ scale: 0.97 }}
            className={`
              relative flex items-center justify-between rounded-2xl border-2 px-6 py-5 text-left
              transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
              ${active
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/60'
              }
            `}
          >
            {/* Language labels */}
            <span className="flex flex-col gap-0.5">
              <span className={`font-serif text-2xl font-bold leading-tight ${active ? 'text-primary' : 'text-foreground'}`}>
                {meta.native}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {meta.subtitle}
              </span>
            </span>

            {/* Active checkmark */}
            <AnimatePresence>
              {active && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
                  aria-hidden="true"
                >
                  <Check className="size-5" strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )
      })}
    </div>
  )
}

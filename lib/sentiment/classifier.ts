/**
 * Three-tier OA-specific sentiment classifier.
 *
 * Design rationale:
 * - This is a rule-based / lexicon classifier, not an opaque LLM call.
 * - Every "concerning" flag comes with the exact trigger terms that caused it,
 *   so a clinician reviewing the flag can see precisely why it fired.
 * - Scope: flags pain journal entries for clinician attention. This is NOT a
 *   mental-health or crisis-detection tool. No escalation beyond the flag.
 * - Three confidence tiers allow the staff view to distinguish "almost certainly
 *   needs attention" (high) from "worth a look" (low).
 *
 * Extending: add terms to the arrays below. Keep them OA/pain-specific —
 * do not add general mental-health or self-harm terms (out of scope per spec).
 */

import type { SentimentFlag } from '@/lib/types/assessment'

export type SentimentResult = {
  flag: SentimentFlag
  /** The exact substring(s) that triggered the classification. */
  triggers: string[]
  /** Confidence level — useful for the staff view UI. */
  confidence: 'high' | 'medium' | 'low'
}

// ─── Tier 1: High-concern ─────────────────────────────────────────────────────
// Any single match → 'concerning' / 'high'
// Indicates significant functional impairment or severe pain expression.
const HIGH_CONCERN_TERMS = [
  'unbearable',
  'excruciating',
  'agonising',
  'agonizing',
  'cannot walk',
  "can't walk",
  'immobile',
  'paralysed',
  'paralyzed',
  'completely unable',
  'bed-ridden',
  'bedridden',
  'screaming in pain',
  'constant agony',
  'no relief at all',
  'completely bedridden',
  'cannot move',
  "can't move",
]

// ─── Tier 2: Medium-concern ───────────────────────────────────────────────────
// Any single match → 'concerning' / 'medium'
// Indicates persistent worsening, significant sleep disruption, or strong distress.
const MEDIUM_CONCERN_TERMS = [
  'getting worse',
  'much worse',
  'deteriorating',
  'worsening',
  'no improvement',
  'nothing helps',
  'no relief',
  'can\'t sleep',
  'cannot sleep',
  'interrupted sleep',
  'pain kept me up',
  'pain woke me',
  'sleepless',
  'severe pain',
  'severe stiffness',
  'hopeless',
  'desperate',
  'nonstop',
  'non-stop',
  'constant pain',
  'pain every day',
  'every single day',
  'worst day',
  'worst pain',
]

// ─── Tier 3: Low-concern ─────────────────────────────────────────────────────
// 2+ matches → 'concerning' / 'low'
// Individual terms are common in OA but clusters suggest a harder day.
const LOW_CONCERN_TERMS = [
  'painful',
  'a lot of pain',
  'hard day',
  'difficult day',
  'struggled',
  'struggling',
  'very stiff',
  'quite stiff',
  'limited movement',
  'reduced mobility',
  'swollen',
  'swelling',
  'discomfort',
  'aching',
  'achy',
  'throbbing',
  'hurt',
  'hurts',
]

// ─── Classifier ───────────────────────────────────────────────────────────────

function findMatches(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(term))
}

/**
 * Classify a journal entry's free-text notes.
 * Returns the flag, the trigger terms, and the confidence tier.
 */
export function classifySentiment(text: string): SentimentResult {
  const normalised = text.toLowerCase()

  // Tier 1 check
  const highTriggers = findMatches(normalised, HIGH_CONCERN_TERMS)
  if (highTriggers.length > 0) {
    return { flag: 'concerning', triggers: highTriggers, confidence: 'high' }
  }

  // Tier 2 check
  const mediumTriggers = findMatches(normalised, MEDIUM_CONCERN_TERMS)
  if (mediumTriggers.length > 0) {
    return { flag: 'concerning', triggers: mediumTriggers, confidence: 'medium' }
  }

  // Tier 3 check — need at least 2 hits
  const lowTriggers = findMatches(normalised, LOW_CONCERN_TERMS)
  if (lowTriggers.length >= 2) {
    return { flag: 'concerning', triggers: lowTriggers, confidence: 'low' }
  }

  return { flag: 'neutral', triggers: [], confidence: 'low' }
}

/**
 * Simple compatibility shim matching the existing SentimentFlag contract.
 * Use classifySentiment() when you also need triggers/confidence.
 */
export function analyzeSentiment(text: string): SentimentFlag {
  return classifySentiment(text).flag
}

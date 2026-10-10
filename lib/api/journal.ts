import type { JournalEntry, SentimentFlag } from '@/lib/types/assessment'
import { classifySentiment } from '@/lib/sentiment/classifier'

// ─── Sentiment analysis ───────────────────────────────────────────────────────

/**
 * Calls POST /api/journal/sentiment for server-side classification.
 * Falls back to the local classifier (same logic) on network error
 * so the UI always gets a result.
 *
 * Returns the full SentimentResult including trigger terms.
 * The plain SentimentFlag (for existing callers) is at result.flag.
 */
export async function analyzeSentimentFull(
  text: string,
): Promise<{ flag: SentimentFlag; triggers: string[]; confidence: 'high' | 'medium' | 'low' }> {
  try {
    const res = await fetch('/api/journal/sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    // Fallback to local classifier — same deterministic result
    return classifySentiment(text)
  }
}

/**
 * Simple shim for existing callers that only need the SentimentFlag.
 * @deprecated Prefer analyzeSentimentFull() to get trigger terms.
 */
export function analyzeSentiment(text: string): SentimentFlag {
  return classifySentiment(text).flag
}

// ─── In-memory store ──────────────────────────────────────────────────────────
// PLACEHOLDER: Replace with GET/POST /api/journal endpoints backed by a database.

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms))

let journalStore: JournalEntry[] = [
  {
    id: 'j1',
    patientId: 'p1',
    date: 'Yesterday',
    painLevel: 3,
    location: 'Right Knee',
    notes: 'Mild stiffness in the morning, eased after a short walk.',
    sentiment: 'neutral',
  },
  {
    id: 'j2',
    patientId: 'p1',
    date: '2 days ago',
    painLevel: 4,
    location: 'Right Knee',
    notes: 'Some discomfort climbing stairs but manageable.',
    sentiment: 'neutral',
  },
  {
    id: 'j3',
    patientId: 'p1',
    date: '3 days ago',
    painLevel: 7,
    location: 'Left Hip',
    notes: 'Difficult day, pain interrupted sleep. Rested more than usual.',
    sentiment: 'neutral',
  },
  {
    id: 'j4',
    patientId: 'p1',
    date: '5 days ago',
    painLevel: 9,
    location: 'Right Knee',
    notes: 'Worst day in weeks. Unbearable pain. Cannot walk without support.',
    sentiment: 'concerning',
  },
]

let journalCounter = 5

export async function getJournalEntries(patientId: string): Promise<JournalEntry[]> {
  try {
    const res = await fetch(`/api/journal?patientId=${encodeURIComponent(patientId)}`, {
      method: 'GET',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[journal] API call failed, using mock fallback:', err)
    return journalStore.filter((e) => e.patientId === patientId)
  }
}

export async function saveJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'sentiment'>,
): Promise<JournalEntry> {
  try {
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[journal] API call failed, using mock fallback:', err)
    const sentimentResult = await analyzeSentimentFull(entry.notes)
    const saved: JournalEntry = {
      ...entry,
      id: `j${journalCounter++}`,
      sentiment: sentimentResult.flag,
    }
    journalStore = [saved, ...journalStore]
    return saved
  }
}


/**
 * Embedding module — uses the Gemini Embedding API (gemini-embedding-001).
 *
 * Why: @xenova/transformers' internal fetch calls during model download
 * interfere with the Next.js Route Handler fetch instrumentation, causing
 * subsequent fetch calls (e.g. Gemini SDK) to fail with "fetch failed".
 * Using the Gemini Embedding API avoids running any native WASM/fetch in-process
 * and keeps the dependency count down (same GEMINI_API_KEY, no extra package).
 *
 * text-embedding-004 output dimension: 768
 * PLACEHOLDER: If you want to switch to a local embedding model later,
 * use a Python sidecar service (FastAPI + sentence-transformers) and call it
 * via HTTP from here — that keeps WASM out of the Next.js process entirely.
 *
 * Fallback: if GEMINI_API_KEY is not set, falls back to TF-IDF keyword
 * matching so the route still returns sensible results without any API key.
 */

import { OA_CHUNKS, type Chunk } from '@/lib/rag/corpus'

export const VECTOR_DIM = 3072 // gemini-embedding-001 output dimension

type IndexEntry = { chunk: Chunk; embedding: number[] }
let index: IndexEntry[] = []
let indexBuilt = false
let buildPromise: Promise<void> | null = null

// ─── Gemini embedding ─────────────────────────────────────────────────────────

async function geminiEmbed(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
      }),
    },
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini embedding error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.embedding.values as number[]
}

// ─── TF-IDF fallback (no API key needed) ─────────────────────────────────────

/** Very small TF-IDF: returns a bag-of-words term-frequency vector. */
function tfidfVector(text: string, vocab: string[]): number[] {
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean)
  const tf = new Map<string, number>()
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
  return vocab.map((w) => (tf.get(w) ?? 0) / (tokens.length || 1))
}

let _vocab: string[] | null = null
function buildVocab(): string[] {
  if (_vocab) return _vocab
  const wordSet = new Set<string>()
  for (const chunk of OA_CHUNKS) {
    chunk.text.toLowerCase().split(/\W+/).filter(Boolean).forEach((w) => wordSet.add(w))
  }
  _vocab = Array.from(wordSet)
  return _vocab
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    return geminiEmbed(text, apiKey)
  }
  // Fallback: TF-IDF keyword vector
  return tfidfVector(text, buildVocab())
}

export async function buildIndex(): Promise<void> {
  if (indexBuilt) return
  if (buildPromise) return buildPromise
  buildPromise = (async () => {
    const apiKey = process.env.GEMINI_API_KEY
    const entries: IndexEntry[] = []
    try {
      for (const chunk of OA_CHUNKS) {
        const embedding = apiKey
          ? await geminiEmbed(chunk.text, apiKey)
          : tfidfVector(chunk.text, buildVocab())
        entries.push({ chunk, embedding })
      }
      index = entries
      indexBuilt = true
    } catch (err) {
      // Reset so the next request can retry
      buildPromise = null
      throw err
    }
  })()
  return buildPromise
}

export function getIndex(): IndexEntry[] {
  return index
}

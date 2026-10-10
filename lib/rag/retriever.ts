/**
 * Brute-force cosine-similarity retriever over the in-memory vector index.
 *
 * With 18 chunks the dot-product loop is ~0.1 ms — no approximate-nearest-
 * neighbour index needed. Vectors are 768-dim (Gemini text-embedding-004)
 * or vocab-dim (TF-IDF fallback). Cosine similarity is dimension-agnostic.

 *
 * PLACEHOLDER (pgvector): To move to PostgreSQL/pgvector, replace retrieveChunks
 * with a parameterised SQL query:
 *   SELECT id, text, topic_id, topic_title,
 *          1 - (embedding <=> $1::vector) AS similarity
 *   FROM oa_chunks
 *   ORDER BY embedding <=> $1::vector
 *   LIMIT $2;
 * and remove the in-memory index entirely.
 */

import { getIndex } from '@/lib/rag/embedder'
import type { Chunk } from '@/lib/rag/corpus'

export type RetrievedChunk = Chunk & { score: number }

/**
 * Cosine similarity between two equal-length float vectors.
 * Vectors from all-MiniLM-L6-v2 are already L2-normalised,
 * so this reduces to a simple dot-product.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot
}

/**
 * Retrieve the top-K most relevant chunks for a given query embedding.
 *
 * @param queryEmbedding  float[] produced by embedText()
 * @param topK            number of chunks to return (default 3)
 * @param minScore        minimum similarity threshold (0–1); filters noise
 */
export function retrieveChunks(
  queryEmbedding: number[],
  topK = 3,
  minScore = 0.25,
): RetrievedChunk[] {
  const index = getIndex()
  if (index.length === 0) return []

  const scored = index.map(({ chunk, embedding }) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, embedding),
  }))

  return scored
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

import type { EducationTopic } from '@/lib/data'

/**
 * Searches education topics by substring match across title, summary, content, and tag.
 *
 * PLACEHOLDER: To swap in embeddings-based semantic search, only this one function
 * needs to change — replace the filter with a vector similarity lookup against
 * your embeddings index, keeping the same signature:
 *   searchTopics(query: string, topics: EducationTopic[]): EducationTopic[]
 *
 * Keeping search synchronous (not async) here because the mock is instant.
 * If the real backend is remote, change the signature to:
 *   searchTopics(query: string, topics: EducationTopic[]): Promise<EducationTopic[]>
 */
export function searchTopics(query: string, topics: EducationTopic[]): EducationTopic[] {
  const q = query.toLowerCase().trim()
  if (!q) return topics
  return topics.filter((topic) => {
    const haystack = [
      topic.title,
      topic.summary,
      topic.tag,
      ...topic.content,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

/**
 * POST /api/journal/sentiment
 *
 * Classifies a pain journal entry's free-text notes.
 *
 * Request: { text: string }
 * Response: { flag: 'neutral'|'concerning', triggers: string[], confidence: 'high'|'medium'|'low' }
 *
 * This endpoint exists so the frontend can call a real implementation
 * rather than the stub in lib/api/journal.ts. The classifier is rule-based
 * (see lib/sentiment/classifier.ts) — every flag includes the trigger terms
 * so a reviewing clinician can see exactly why it fired.
 */

import { NextRequest } from 'next/server'
import { classifySentiment } from '@/lib/sentiment/classifier'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text: string = body.text ?? ''

    if (typeof text !== 'string' || text.trim().length === 0) {
      return Response.json(
        { error: 'invalid_input', message: 'text must be a non-empty string' },
        { status: 400 },
      )
    }

    const result = classifySentiment(text)
    return Response.json(result)
  } catch (err) {
    console.error('[/api/journal/sentiment]', err)
    return Response.json({ error: 'internal_error', message: String(err) }, { status: 500 })
  }
}

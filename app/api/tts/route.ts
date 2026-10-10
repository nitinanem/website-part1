import { NextRequest } from 'next/server'
import type { Language } from '@/lib/i18n/context'

// Default ElevenLabs Voice ID (Rachel)
const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const text: string = (body.text ?? '').trim()
    const lang: Language = body.lang ?? 'en'

    if (!text) {
      return Response.json({ error: 'empty_text' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      return Response.json({
        fallback: true,
        provider: 'browser',
        message: 'ELEVENLABS_API_KEY is not configured. Falling back to browser speech synthesis.',
      })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[ElevenLabs TTS] Upstream error: ${errText}`)
      return Response.json({
        fallback: true,
        provider: 'browser',
        error: errText,
      })
    }

    const arrayBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64')

    return Response.json({
      audioBase64,
      format: 'audio/mpeg',
      provider: 'elevenlabs',
      language: lang,
    })
  } catch (err) {
    console.error('[/api/tts] error:', err)
    return Response.json({
      fallback: true,
      provider: 'browser',
      error: String(err),
    })
  }
}

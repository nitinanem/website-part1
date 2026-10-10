import { NextRequest, NextResponse } from 'next/server'
import { getJournalEntries } from '@/lib/api/journal'
import { getSession } from '@/lib/auth-session'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let patientId = searchParams.get('patientId')

    if (!patientId) {
      const authSession = await getSession()
      if (authSession?.patientId) {
        patientId = authSession.patientId
      }
    }

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
    }

    const entries = await getJournalEntries(patientId)

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        insights: "No journal entries found yet. Start logging your pain and symptoms to receive AI-powered personalized health insights."
      })
    }

    // Pass the last 14 entries to Gemini for analysis
    const recentEntries = entries.slice(0, 14).map((e) => ({
      date: e.date,
      createdAt: (e as any).createdAt,
      painLevel: e.painLevel,
      location: e.location,
      notes: e.notes,
      sentiment: e.sentiment
    }))

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    const prompt = `You are an expert, empathetic clinical AI assistant named Swastik for JointCare.
Analyze the following recent journal entries for a patient with osteoarthritis.
Provide a concise, highly personalized 2-paragraph health insight summary.
Identify trends (e.g., pain increasing/decreasing, triggers mentioned in notes).
Keep it encouraging and supportive. DO NOT give medical diagnoses, but you can suggest talking to their doctor if pain is consistently high (7+).
Use Markdown formatting.

PATIENT JOURNAL DATA:
${JSON.stringify(recentEntries, null, 2)}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ insights: text })
  } catch (err: any) {
    console.error('[GET /api/insights]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

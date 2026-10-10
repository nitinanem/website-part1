import { NextRequest, NextResponse } from 'next/server'
import {
  parseAge,
  parseGender,
  parseName,
  parsePhone,
  parseYesNo,
  parseCommand,
} from '@/lib/voice/voice-form-parser'

const LANGUAGE_LABELS: Record<string, string> = {
  hi: 'Hindi',
  as: 'Assamese',
  bn: 'Bengali',
  pa: 'Punjabi',
  en: 'English',
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ])
}

function buildVoicePrompt(clean: string, currentStep: string, language: string) {
  const langName = LANGUAGE_LABELS[language] || 'Hindi'
  return `You are a clinical voice assistant helping elderly Indian patients fill out a joint health form.
The patient said: "${clean}"
The current form field being asked is: "${currentStep || 'general'}"
Language context: "${langName}" (${language})

Analyze the patient's statement and extract the intended answer.
Fields in this form:
- "name": string (patient's full name, strip conversational prefixes)
- "age": integer between 10 and 120 (e.g. from "पैंसठ", "साठ साल", "65", "seventy", "৬২ বছৰ")
- "gender": "male" | "female" | "other"
- "phone": string of 10 digits
- "q1" (persistent knee/joint pain for weeks): boolean (true if affirmed, false if denied)
- "q2" (morning joint stiffness): boolean (true if affirmed, false if denied)
- "q3" (difficulty walking or climbing stairs): boolean (true if affirmed, false if denied)
- "q4" (swelling or cracking sounds in joints): boolean (true if affirmed, false if denied)
- "q5" (pain worsening over time): boolean (true if affirmed, false if denied)
- "command": "next" | "prev" | "repeat" | "submit" | null

Return JSON ONLY with this exact structure:
{
  "type": "name" | "age" | "gender" | "phone" | "boolean" | "command" | "unknown",
  "field": "name" | "age" | "gender" | "phone" | "q1" | "q2" | "q3" | "q4" | "q5" | null,
  "value": any,
  "command": "next" | "prev" | "repeat" | "submit" | null,
  "confidence": number between 0 and 1,
  "spokenConfirmation": string (a gentle, warm, short 1-sentence confirmation for the elderly patient in ${langName})
}`
}

function extractJson(text: string): any {
  if (!text) throw new Error('Empty response from model')
  try {
    return JSON.parse(text)
  } catch {
    // Attempt markdown block extraction
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    }
    // Attempt first '{' and last '}' extraction
    const firstOpen = text.indexOf('{')
    const lastClose = text.lastIndexOf('}')
    if (firstOpen !== -1 && lastClose > firstOpen) {
      return JSON.parse(text.slice(firstOpen, lastClose + 1))
    }
    throw new Error('Unable to extract valid JSON: ' + text.slice(0, 100))
  }
}

async function tryGemini(clean: string, currentStep: string, language: string) {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) throw new Error('GEMINI_API_KEY not configured')

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(geminiKey)

  // Prioritise fast, high-availability models with strict timeout
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash']
  let lastErr: any = null

  const prompt = buildVoicePrompt(clean, currentStep, language)

  for (const modelName of candidateModels) {
    try {
      const callPromise = (async () => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        })
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        const parsed = extractJson(text)
        if (!parsed || parsed.type === 'unknown') {
          throw new Error('Gemini returned unknown result')
        }
        return parsed
      })()

      // 2500ms max per candidate
      return await withTimeout(callPromise, 2500, `Gemini ${modelName}`)
    } catch (err: any) {
      lastErr = err
      // If 404 model not found or timeout, try next candidate
      if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('timed out')) {
        continue
      }
      throw err
    }
  }

  throw lastErr || new Error('All Gemini candidate models failed')
}

async function tryGroq(clean: string, currentStep: string, language: string) {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('GROQ_API_KEY not configured')

  const prompt = buildVoicePrompt(clean, currentStep, language)
  // Fast, tested Groq models: openai/gpt-oss-20b (~560ms), openai/gpt-oss-120b (~500ms)
  const candidateModels = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'groq/compound']
  let lastErr: any = null

  for (const modelName of candidateModels) {
    try {
      const fetchPromise = (async () => {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: 'system',
                content: 'You are an expert clinical voice assistant. Return valid JSON only with no markdown.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 350,
            temperature: 0.1,
          }),
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Groq ${modelName} error (${res.status}): ${errText}`)
        }

        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        const parsed = extractJson(content)
        if (!parsed || parsed.type === 'unknown') {
          throw new Error(`Groq ${modelName} returned unknown result`)
        }
        return parsed
      })()

      // 3000ms max per candidate
      return await withTimeout(fetchPromise, 3000, `Groq ${modelName}`)
    } catch (err: any) {
      lastErr = err
      continue
    }
  }

  throw lastErr || new Error('All Groq candidate models failed')
}

function runLocalVoiceAgent(clean: string, currentStep: string, language: string) {
  // Navigation commands
  const command = parseCommand(clean)
  if (command) {
    let confirmation = 'Moving to next.'
    if (command === 'repeat') {
      if (language === 'hi') confirmation = 'मैं सवाल दोबारा दोहरा रहा हूँ।'
      else if (language === 'as') confirmation = 'মই প্ৰশ্নটো পুনৰ কৈছোঁ।'
      else if (language === 'bn') confirmation = 'আমি প্রশ্নটি আবার বলছি।'
      else if (language === 'pa') confirmation = 'ਮੈਂ ਸਵਾਲ ਦੁਬਾਰਾ ਬੋਲ ਰਿਹਾ ਹਾਂ।'
      else confirmation = 'Repeating the question.'
    } else if (command === 'next') {
      if (language === 'hi') confirmation = 'अगला सवाल।'
      else if (language === 'as') confirmation = 'পৰৱৰ্তী প্ৰশ্ন।'
      else if (language === 'bn') confirmation = 'পরবর্তী প্রশ্ন।'
      else if (language === 'pa') confirmation = 'ਅਗਲਾ ਸਵਾਲ।'
      else confirmation = 'Moving to next.'
    } else if (command === 'prev') {
      if (language === 'hi') confirmation = 'पिछला सवाल।'
      else if (language === 'as') confirmation = 'পূৰ্বৱৰ্তী প্ৰশ্ন।'
      else if (language === 'bn') confirmation = 'পূর্ববর্তী প্রশ্ন।'
      else if (language === 'pa') confirmation = 'ਪਿਛਲਾ ਸਵਾਲ।'
      else confirmation = 'Going back.'
    } else if (command === 'submit') {
      if (language === 'hi') confirmation = 'फॉर्म जमा कर रहे हैं।'
      else if (language === 'as') confirmation = 'প্ৰ-পত্ৰ জমা দিয়া হৈছে।'
      else if (language === 'bn') confirmation = 'ফর্ম জমা দেওয়া হচ্ছে।'
      else if (language === 'pa') confirmation = 'ਫ਼ਾਰਮ ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।'
      else confirmation = 'Submitting form.'
    }

    return {
      type: 'command',
      command,
      spokenConfirmation: confirmation,
      provider: 'local_voice_agent',
    }
  }

  // Field by field rule parsing
  if (currentStep === 'age') {
    const ageVal = parseAge(clean)
    if (ageVal !== null) {
      let confirmation = `Recorded age ${ageVal}.`
      if (language === 'hi') confirmation = `आपकी उम्र ${ageVal} वर्ष दर्ज कर ली गई है।`
      else if (language === 'as') confirmation = `আপোনাৰ বয়স ${ageVal} বছৰ লিপিবদ্ধ কৰা হ'ল।`
      else if (language === 'bn') confirmation = `আপনার বয়স ${ageVal} বছর রেকর্ড করা হয়েছে।`
      else if (language === 'pa') confirmation = `ਤੁਹਾਡੀ ਉਮਰ ${ageVal} ਸਾਲ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ।`

      return {
        type: 'age',
        value: ageVal,
        spokenConfirmation: confirmation,
        provider: 'local_voice_agent',
      }
    }
  } else if (currentStep === 'gender') {
    const genderVal = parseGender(clean)
    if (genderVal !== null) {
      let confirmation = `Selected ${genderVal}.`
      if (language === 'hi') {
        const label = genderVal === 'female' ? 'महिला' : genderVal === 'male' ? 'पुरुष' : 'अन्य'
        confirmation = `${label} चुना गया है।`
      } else if (language === 'as') {
        const label = genderVal === 'female' ? 'মহিলা' : genderVal === 'male' ? 'পুৰুষ' : 'অন্য'
        confirmation = `${label} বাছনি কৰা হ'ল।`
      } else if (language === 'bn') {
        const label = genderVal === 'female' ? 'মহিলা' : genderVal === 'male' ? 'পুরুষ' : 'অন্য'
        confirmation = `${label} নির্বাচন করা হয়েছে।`
      } else if (language === 'pa') {
        const label = genderVal === 'female' ? 'ਮਹਿਲਾ' : genderVal === 'male' ? 'ਪੁਰਸ਼' : 'ਹੋਰ'
        confirmation = `${label} ਚੁਣਿਆ ਗਿਆ ਹੈ।`
      }

      return {
        type: 'gender',
        value: genderVal,
        spokenConfirmation: confirmation,
        provider: 'local_voice_agent',
      }
    }
  } else if (currentStep === 'phone') {
    const phoneVal = parsePhone(clean)
    if (phoneVal !== null) {
      let confirmation = 'Recorded phone number.'
      if (language === 'hi') confirmation = 'फ़ोन नंबर दर्ज कर लिया गया है।'
      else if (language === 'as') confirmation = 'ফোন নম্বৰ লিপিবদ্ধ কৰা হ’ল।'
      else if (language === 'bn') confirmation = 'ফোন নম্বর রেকর্ড করা হয়েছে।'
      else if (language === 'pa') confirmation = 'ਫ਼ੋਨ ਨੰਬਰ ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।'

      return {
        type: 'phone',
        value: phoneVal,
        spokenConfirmation: confirmation,
        provider: 'local_voice_agent',
      }
    }
  } else if (currentStep === 'name') {
    const nameVal = parseName(clean)
    if (nameVal && nameVal.length >= 2) {
      let confirmation = `Hello ${nameVal}.`
      if (language === 'hi') confirmation = `नमस्ते ${nameVal} जी।`
      else if (language === 'as') confirmation = `নমস্কাৰ ${nameVal} ডাঙৰীয়া।`
      else if (language === 'bn') confirmation = `নমস্কার ${nameVal} বাবু।`
      else if (language === 'pa') confirmation = `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ${nameVal} ਜੀ।`

      return {
        type: 'name',
        value: nameVal,
        spokenConfirmation: confirmation,
        provider: 'local_voice_agent',
      }
    }
  } else if (currentStep?.startsWith('q')) {
    const boolVal = parseYesNo(clean)
    if (boolVal !== null) {
      let confirmation = boolVal ? 'Recorded yes.' : 'Recorded no.'
      if (language === 'hi') confirmation = boolVal ? 'हाँ, दर्ज कर लिया गया है।' : 'नहीं, दर्ज कर लिया गया है।'
      else if (language === 'as') confirmation = boolVal ? 'হয়, লিপিবদ্ধ কৰা হ’ল।' : 'নহয়, লিপিবদ্ধ কৰা হ’ল।'
      else if (language === 'bn') confirmation = boolVal ? 'হ্যাঁ, রেকর্ড করা হয়েছে।' : 'না, রেকর্ড করা হয়েছে।'
      else if (language === 'pa') confirmation = boolVal ? 'ਹਾਂ, ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।' : 'ਨਹੀਂ, ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।'

      return {
        type: 'boolean',
        value: boolVal,
        field: currentStep,
        spokenConfirmation: confirmation,
        provider: 'local_voice_agent',
      }
    }
  }

  let unknownMsg = 'Sorry, I did not catch that. Please speak again.'
  if (language === 'hi') unknownMsg = 'माफ़ कीजिए, मैं समझ नहीं पाया। कृपया दोबारा बोलें।'
  else if (language === 'as') unknownMsg = 'মাফ কৰিব, মই বুজি নাপালোঁ। অনুগ্ৰহ কৰি পুনৰ কওক।'
  else if (language === 'bn') unknownMsg = 'দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আবার বলুন।'
  else if (language === 'pa') unknownMsg = 'ਮਾਫ਼ ਕਰਨਾ, ਮੈਂ ਸਮਝ ਨਹੀਂ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।'

  return {
    type: 'unknown',
    spokenConfirmation: unknownMsg,
    provider: 'local_voice_agent',
  }
}

export async function POST(req: NextRequest) {
  let clean = ''
  let currentStep = 'general'
  let language = 'hi'

  try {
    const body = await req.json()
    const { transcript, simulateFail } = body
    currentStep = body.currentStep || 'general'
    language = body.language || 'hi'

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    clean = transcript.trim()

    // ── LAYER 1: Google Gemini API (Primary) ──────────────────────────────────
    if (simulateFail !== 'gemini' && simulateFail !== 'both') {
      try {
        const geminiResult = await tryGemini(clean, currentStep, language)
        console.log(`[Multi-Layer Voice] Layer 1 (Gemini API) succeeded`)
        return NextResponse.json({ ...geminiResult, provider: 'gemini' })
      } catch (geminiErr: any) {
        console.warn(`[Multi-Layer Voice] Layer 1 (Gemini) failed: ${geminiErr.message}. Shifting to Layer 2 (Groq)...`)
      }
    } else {
      console.warn(`[Multi-Layer Voice] Layer 1 (Gemini) simulated failure. Shifting to Layer 2 (Groq)...`)
    }

    // ── LAYER 2: Groq API (Fallback 1) ────────────────────────────────────────
    if (simulateFail !== 'groq' && simulateFail !== 'both') {
      try {
        const groqResult = await tryGroq(clean, currentStep, language)
        console.log(`[Multi-Layer Voice] Layer 2 (Groq API) succeeded`)
        return NextResponse.json({ ...groqResult, provider: 'groq' })
      } catch (groqErr: any) {
        console.warn(`[Multi-Layer Voice] Layer 2 (Groq) failed: ${groqErr.message}. Shifting to Layer 3 (Local Voice Agent Engine)...`)
      }
    } else {
      console.warn(`[Multi-Layer Voice] Layer 2 (Groq) simulated failure. Shifting to Layer 3 (Local Voice Agent Engine)...`)
    }

    // ── LAYER 3: Local Voice Agent Engine (Fallback 2 / Deterministic) ────────
    console.log(`[Multi-Layer Voice] Running Layer 3 (Local Voice Agent Engine)...`)
    const localResult = runLocalVoiceAgent(clean, currentStep, language)
    return NextResponse.json(localResult)
  } catch (err: any) {
    console.error('[POST /api/voice/parse-intent]', err)
    // Always provide safe fallback response so the senior's voice flow never breaks
    if (clean) {
      const localResult = runLocalVoiceAgent(clean, currentStep, language)
      return NextResponse.json(localResult)
    }
    return NextResponse.json({ error: 'Failed to parse voice intent' }, { status: 500 })
  }
}

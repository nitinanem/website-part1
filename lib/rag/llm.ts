export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callOpenRouter(messages: Message[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages,
      max_tokens: 800,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenRouter response has no content')
  return content
}

async function callGemini(messages: Message[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(apiKey)
  
  // Extract system message
  const systemMsg = messages.find(m => m.role === 'system')?.content || ''
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    systemInstruction: systemMsg,
  })

  // Format history for Gemini
  type GeminiRole = 'user' | 'model'
  const contents: { role: GeminiRole; parts: { text: string }[] }[] = []

  const nonSystemMessages = messages.filter(m => m.role !== 'system')
  
  for (const m of nonSystemMessages) {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })
  }

  const result = await model.generateContent({ contents })
  return result.response.text()
}

async function callGroq(messages: Message[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages,
      max_tokens: 800,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq API error ${response.status}: ${errText}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content
  if (!content) throw new Error('Groq response has no content')
  return content
}

async function callHuggingFace(messages: Message[]): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY is not set')

  // Try top chat models on Hugging Face router
  const models = ['meta-llama/Llama-3.1-8B-Instruct', 'Qwen/Qwen2.5-72B-Instruct']
  let lastHfError: Error | null = null

  for (const model of models) {
    try {
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`HF error on ${model} (${response.status}): ${errText}`)
      }

      const result = await response.json()
      const content = result.choices?.[0]?.message?.content
      if (content) {
        return content.trim()
      }
    } catch (err) {
      console.warn(`[llm] Hugging Face model ${model} failed:`, err)
      lastHfError = err as Error
    }
  }

  throw lastHfError || new Error('Hugging Face inference failed')
}

/**
 * Attempts to generate a chat response using Hugging Face as the PRIMARY provider,
 * with OpenRouter and Google Gemini as fallbacks.
 */
export async function generateChatResponse(messages: Message[]): Promise<string> {
  let lastError: Error | null = null

  // 1. PRIMARY: Hugging Face API
  try {
    console.log('[llm] Attempting Hugging Face (Primary)...')
    return await callHuggingFace(messages)
  } catch (e) {
    console.warn('[llm] Hugging Face failed:', e)
    lastError = e as Error
  }

  // 2. FALLBACK 1: OpenRouter (Nemotron)
  try {
    console.log('[llm] Attempting OpenRouter (Fallback 1)...')
    return await callOpenRouter(messages)
  } catch (e) {
    console.warn('[llm] OpenRouter failed:', e)
    lastError = e as Error
  }

  // 3. FALLBACK 2: Google Gemini
  try {
    console.log('[llm] Attempting Gemini (Fallback 2)...')
    return await callGemini(messages)
  } catch (e) {
    console.warn('[llm] Gemini failed:', e)
    lastError = e as Error
  }

  // 4. FALLBACK 3: Groq Cloud API
  try {
    console.log('[llm] Attempting Groq (Fallback 3)...')
    return await callGroq(messages)
  } catch (e) {
    console.warn('[llm] Groq failed:', e)
    lastError = e as Error
  }

  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`)
}

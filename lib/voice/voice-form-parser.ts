/**
 * Multilingual Voice Form Parser
 * Specialised for elderly Indian patients speaking in conversational Hindi, English, and regional dialects.
 * Extracts:
 * - Age (numerals, Hindi words like पैंसठ, साठ, सत्तर, English words like sixty-five)
 * - Gender (पुरुष/आदमी/male, महिला/स्त्री/female, अन्य/other)
 * - Names (filters out conversational prefixes like "मेरा नाम ... है", "I am ...")
 * - Phone numbers (spoken digits or 10-digit sequences)
 * - Clinical Yes/No screening responses
 * - Voice navigation commands (next, back, repeat, submit)
 */

export interface ParsedVoiceResult {
  type: 'name' | 'age' | 'gender' | 'phone' | 'boolean' | 'command' | 'unknown'
  value?: string | number | boolean
  command?: 'next' | 'prev' | 'repeat' | 'submit' | 'stop'
  confidence: number
  rawTranscript: string
}

// Hindi number mappings commonly used by seniors
const HINDI_NUMBER_WORDS: Record<string, number> = {
  // Units & teens
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15, 'सोलह': 16, 'सत्रह': 17, 'अट्ठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  // 20s
  'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25, 'छब्बीस': 26, 'सत्ताईस': 27, 'अट्ठाईस': 28, 'उनतीस': 29, 'तीस': 30,
  // 30s
  'इकतीस': 31, 'बत्तीस': 32, 'तैंतीस': 33, 'चौंतीस': 34, 'पैंतीस': 35, 'छत्तीस': 36, 'सैंतीस': 37, 'अड़तीस': 38, 'उनतालीस': 39, 'चालीस': 40,
  // 40s
  'इकतालीस': 41, 'बयालीस': 42, 'तैंतालीस': 43, 'चवालीस': 44, 'पैंतालीस': 45, 'छियालीस': 46, 'सैंतालीस': 47, 'अड़तालीस': 48, 'उनचास': 49, 'पचास': 50,
  // 50s (High prevalence OA age group)
  'इक्यावन': 51, 'बावन': 52, 'तिरेपन': 53, 'चौवन': 54, 'पचपन': 55, 'छप्पन': 56, 'सत्तावन': 57, 'अट्ठावन': 58, 'उनसठ': 59, 'साठ': 60,
  // 60s (Peak OA age group)
  'इकसठ': 61, 'बासठ': 62, 'तिरसठ': 63, 'चौंसठ': 64, 'पैंसठ': 65, 'पैसठ': 65, 'छियासठ': 66, 'सरसठ': 67, 'अड़सठ': 68, 'उनहत्तर': 69, 'सत्तर': 70,
  // 70s
  'इकहत्तर': 71, 'बहत्तर': 72, 'तिहत्तर': 73, 'चौहत्तर': 74, 'पचहत्तर': 75, 'छिहत्तर': 76, 'सतहत्तर': 77, 'अठहत्तर': 78, 'उन्नासी': 79, 'अस्सी': 80,
  // 80s & 90s
  'इक्यासी': 81, 'बयासी': 82, 'तिरासी': 83, 'चौरासी': 84, 'पचासी': 85, 'छियासी': 86, 'सत्तासी': 87, 'अट्ठासी': 88, 'नवासी': 89, 'नब्बे': 90,
  'इक्यानवे': 91, 'बानवे': 92, 'तिरानवे': 93, 'चौरानवे': 94, 'पंचानवे': 95, 'छियानवे': 96, 'सत्तानवे': 97, 'अट्ठानवे': 98, 'निन्यानवे': 99, 'सौ': 100,
}

// English words to numbers
const ENGLISH_NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}

/**
 * Normalize Indic numerals (Devanagari, Bengali/Assamese, Gurmukhi) to ASCII digits (0-9)
 */
export function normalizeIndicDigits(str: string): string {
  return str.replace(/[\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F]/g, (ch) => {
    const code = ch.charCodeAt(0)
    if (code >= 0x0966 && code <= 0x096F) return String(code - 0x0966)
    if (code >= 0x09E6 && code <= 0x09EF) return String(code - 0x09E6)
    if (code >= 0x0A66 && code <= 0x0A6F) return String(code - 0x0A66)
    return ch
  })
}

/**
 * Parse Spoken Age from Transcript
 */
export function parseAge(transcript: string): number | null {
  const normalized = normalizeIndicDigits(transcript)
  const clean = normalized.toLowerCase().trim()

  // Direct digit match (e.g. "65", "68 years", "উম্ৰ 70", "ਉਮਰ 65")
  const digitMatch = clean.match(/\b(\d{1,3})\b/)
  if (digitMatch) {
    const num = parseInt(digitMatch[1], 10)
    if (num >= 5 && num <= 120) return num
  }

  // Hindi word match
  for (const [word, val] of Object.entries(HINDI_NUMBER_WORDS)) {
    if (clean.includes(word)) {
      return val
    }
  }

  // English word compound match (e.g. "sixty five", "seventy two")
  for (const [tensWord, tensVal] of Object.entries(ENGLISH_NUMBER_WORDS)) {
    if (tensVal >= 20 && clean.includes(tensWord)) {
      for (const [unitWord, unitVal] of Object.entries(ENGLISH_NUMBER_WORDS)) {
        if (unitVal < 10 && clean.includes(`${tensWord} ${unitWord}`)) {
          return tensVal + unitVal
        }
      }
      return tensVal
    }
  }

  return null
}

/**
 * Parse Spoken Gender from Transcript
 */
export function parseGender(transcript: string): 'male' | 'female' | 'other' | null {
  const clean = transcript.toLowerCase().trim()

  // Female variations (Hindi/English/Assamese/Bengali/Punjabi)
  if (
    clean.includes('महिला') ||
    clean.includes('स्त्री') ||
    clean.includes('औरत') ||
    clean.includes('female') ||
    clean.includes('woman') ||
    clean.includes('lady') ||
    clean.includes('মহিলা') ||
    clean.includes('স্ত্ৰী') ||
    clean.includes('স্ত্রী') ||
    clean.includes('ਮਹਿਲਾ') ||
    clean.includes('ਔਰਤ')
  ) {
    return 'female'
  }

  // Male variations (Hindi/English/Assamese/Bengali/Punjabi)
  if (
    clean.includes('पुरुष') ||
    clean.includes('आदमी') ||
    clean.includes('मर्द') ||
    clean.includes('लड़का') ||
    clean.includes('male') ||
    clean.includes('man') ||
    clean.includes('পুৰুষ') ||
    clean.includes('পুরুষ') ||
    clean.includes('পুৰুষজনক') ||
    clean.includes('ਪੁਰਸ਼') ||
    clean.includes('ਆਦਮੀ')
  ) {
    return 'male'
  }

  // Other variations
  if (clean.includes('अन्य') || clean.includes('other') || clean.includes('অন্য') || clean.includes('ਹੋਰ')) {
    return 'other'
  }

  return null
}

/**
 * Parse Spoken Yes / No intent for clinical screening questions
 */
export function parseYesNo(transcript: string): boolean | null {
  const clean = transcript.toLowerCase().trim()

  // Negative patterns first (to avoid "नहीं, हाँ" confusion)
  const noPatterns = [
    'नहीं', 'ना', 'ना जी', 'नहीं जी', 'नहीं होता', 'नहीं है', 'बिल्कुल नहीं',
    'no', 'nope', 'never', 'nahin', 'nahi', 'kuch nahi', 'bilkul nahi',
    'না', 'নাজি', 'নহয়', 'নহয়', 'নাই', 'নহব', 'নাহে', // Bengali / Assamese
    'ਨਹੀਂ', 'ਨਹੀਂ ਜੀ', 'ਨਾ', // Punjabi
  ]
  for (const p of noPatterns) {
    if (new RegExp(`(^|\\s)${p}(\\s|$|\\.|,)`, 'i').test(clean) || clean === p) {
      return false
    }
  }

  // Positive patterns
  const yesPatterns = [
    'हाँ', 'हा', 'हाँजी', 'हांजी', 'जी हाँ', 'जी हां', 'हाँ जी', 'होता है', 'दर्द है', 'बहुत है', 'काफी है',
    'yes', 'yeah', 'yep', 'definitely', 'sure', 'true', 'haan', 'hanji',
    'হ্যাঁ', 'হয়', 'হয়', 'আছে', 'হব', "হ'ব", // Bengali / Assamese
    'ਹਾਂ', 'ਹਾਂਜੀ', 'ਹੁੰਦਾ ਹੈ', 'ਦਰਦ ਹੈ', // Punjabi
  ]
  for (const p of yesPatterns) {
    if (new RegExp(`(^|\\s)${p}(\\s|$|\\.|,)`, 'i').test(clean) || clean === p) {
      return true
    }
  }

  return null
}

/**
 * Parse Spoken Name, stripping conversational phrases
 */
export function parseName(transcript: string): string | null {
  let clean = transcript.trim()
  if (!clean || clean.length < 2) return null

  // Remove common conversational fillers (Hindi, English, Assamese, Bengali, Punjabi)
  const prefixes = [
    /^(मेरा नाम\s*(है)?)/i,
    /^(मेरा नाम)/i,
    /^(हमारा नाम)/i,
    /^(नाम है)/i,
    /^(नाम)/i,
    /^(মোৰ নাম\s*(হয়|হল)?)/i,
    /^(মোৰ নাম)/i,
    /^(আমার নাম\s*(হল)?)/i,
    /^(আমার নাম)/i,
    /^(ਮੇਰਾ ਨਾਮ\s*(ਹੈ)?)/i,
    /^(ਮੇਰਾ ਨਾਮ)/i,
    /^(my name is)/i,
    /^(i am)/i,
    /^(this is)/i,
    /^(मुझे\s*.*\s*कहते हैं)/i,
  ]

  for (const pref of prefixes) {
    clean = clean.replace(pref, '').trim()
  }

  // Remove trailing "है", "ji", "bol raha hu", "speaking", "হয়", "ਹੈ"
  clean = clean
    .replace(/(है|हूँ|बोल रहा हूँ|बोल रही हूँ|speaking|হয়|হল|কৈ আছোঁ|ਹੈ)$/i, '')
    .replace(/[.,!?]/g, '')
    .trim()

  if (clean.length >= 2 && !/^(हाँ|नहीं|yes|no|হয়|নহয়|হ্যাঁ|না|ਹਾਂ|ਨਹੀਂ)$/i.test(clean)) {
    // Capitalize first letter of each word if romanized
    return clean
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ')
  }

  return null
}

/**
 * Parse Spoken Phone Number (10 digits)
 */
export function parsePhone(transcript: string): string | null {
  const normalized = normalizeIndicDigits(transcript)
  const digitsOnly = normalized.replace(/\D/g, '')
  if (digitsOnly.length === 10) {
    return digitsOnly
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2)
  }
  return null
}

/**
 * Parse Navigation & Assistant Voice Commands
 */
export function parseCommand(transcript: string): 'next' | 'prev' | 'repeat' | 'submit' | 'stop' | null {
  const clean = transcript.toLowerCase().trim()

  if (
    clean.includes('अगला') ||
    clean.includes('आगे') ||
    clean.includes('next') ||
    clean.includes('aage') ||
    clean.includes('আগলৈ') ||
    clean.includes('পরবর্তী') ||
    clean.includes('ਅਗਲਾ')
  ) {
    return 'next'
  }
  if (
    clean.includes('पीछे') ||
    clean.includes('वापस') ||
    clean.includes('back') ||
    clean.includes('peeche') ||
    clean.includes('পিছলৈ') ||
    clean.includes('পূর্ববর্তী') ||
    clean.includes('ਪਿਛਲਾ')
  ) {
    return 'prev'
  }
  if (
    clean.includes('दोबारा') ||
    clean.includes('फिर से') ||
    clean.includes('repeat') ||
    clean.includes('fir se') ||
    clean.includes('suna nahi') ||
    clean.includes('পুনৰ') ||
    clean.includes('আকৌ') ||
    clean.includes('আবার') ||
    clean.includes('ਦੁਬਾਰਾ')
  ) {
    return 'repeat'
  }
  if (
    clean.includes('जमा') ||
    clean.includes('सबमिट') ||
    clean.includes('submit') ||
    clean.includes('bhejo') ||
    clean.includes('done') ||
    clean.includes('জমা দিয়ক') ||
    clean.includes('জমা দিন') ||
    clean.includes('ਜਮ੍ਹਾਂ')
  ) {
    return 'submit'
  }
  if (
    clean.includes('रुक') ||
    clean.includes('बंद') ||
    clean.includes('stop') ||
    clean.includes('cancel') ||
    clean.includes('বন্ধ')
  ) {
    return 'stop'
  }

  return null
}

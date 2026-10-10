export type ViewState = 'public' | 'auth' | 'dashboard' | 'study'
export type StudyTopicId = 'know-oa' | 'symptoms' | 'diet' | 'exercise'

// Re-export shared types so existing imports keep working
export type { Language, ChatMessage, JournalEntry, SentimentFlag, UserSettings } from '@/lib/types/assessment'
// Import locally so the type is available in this file; re-exported below
import type { WomacKoosQuestion, Language } from '@/lib/types/assessment'
export type { WomacKoosQuestion }

export const languageLabels: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  pa: 'ਪੰਜਾਬੀ',
  bn: 'বাংলা',
  as: 'অসমীয়া',
}

export type EducationTopic = {
  id: string
  title: string
  summary: string
  content: string[]
  tag: string
}

export const educationTopics: EducationTopic[] = [
  {
    id: 'know-oa',
    title: 'Know About OA',
    tag: 'Basics',
    summary: 'Understand what osteoarthritis is and how it affects your joints.',
    content: [
      'Osteoarthritis (OA) is the most common form of arthritis. It occurs when the protective cartilage that cushions the ends of your bones wears down over time.',
      'While OA can damage any joint, it most commonly affects joints in the hands, knees, hips, and spine. The condition develops gradually and worsens over time.',
      'The good news: symptoms can usually be managed through movement, a healthy weight, supportive footwear, and staying active. OA is manageable, not a life sentence.',
    ],
  },
  {
    id: 'symptoms',
    title: 'Symptoms & Risk Factors',
    tag: 'Awareness',
    summary: 'Recognise early warning signs and understand what raises your risk.',
    content: [
      'Common symptoms include joint pain during or after movement, stiffness (especially in the morning), tenderness, loss of flexibility, and a grating sensation.',
      'Key risk factors include older age, being overweight, previous joint injuries, repetitive stress on a joint, and family history.',
      'Early recognition matters. If you notice persistent joint stiffness that lasts more than a few weeks, it is worth speaking to a healthcare professional.',
    ],
  },
  {
    id: 'diet',
    title: 'Diet & Nutrition',
    tag: 'Lifestyle',
    summary: 'Eat to reduce inflammation and support healthy joints.',
    content: [
      'A balanced, anti-inflammatory diet can help manage OA symptoms. Focus on omega-3 rich foods like fish, flaxseed, and walnuts.',
      'Include plenty of colourful fruits and vegetables, whole grains, and legumes. These provide antioxidants that help protect joint tissue.',
      'Maintaining a healthy weight reduces load on weight-bearing joints. Losing even a small amount of weight can significantly reduce knee and hip pain.',
    ],
  },
  {
    id: 'exercise',
    title: 'Exercise & Physical Activity',
    tag: 'Movement',
    summary: 'Safe, joint-friendly movement to keep you strong and mobile.',
    content: [
      'Movement is medicine for OA. Low-impact activities like walking, swimming, and cycling strengthen the muscles that support your joints.',
      'Gentle range-of-motion and stretching exercises reduce stiffness and maintain flexibility. Aim for consistency over intensity.',
      'Always warm up before activity and stop if you feel sharp pain. A physiotherapist can design a routine tailored to your joints.',
    ],
  },
]

export type DoctorCheckQuestion = {
  id: string
  question: string
}

export const doctorCheckQuestions: DoctorCheckQuestion[] = [
  { id: 'q1', question: 'Is your joint pain persistent, lasting more than a few weeks?' },
  { id: 'q2', question: 'Do you experience stiffness in the morning or after resting?' },
  { id: 'q3', question: 'Does the pain affect your daily activities, such as walking or climbing stairs?' },
  { id: 'q4', question: 'Have you noticed swelling or a grating sensation in the joint?' },
  { id: 'q5', question: 'Is the pain getting worse over time rather than improving?' },
]

export const painTrendData = [
  { day: 'Mon', pain: 6 },
  { day: 'Tue', pain: 5 },
  { day: 'Wed', pain: 7 },
  { day: 'Thu', pain: 4 },
  { day: 'Fri', pain: 4 },
  { day: 'Sat', pain: 3 },
  { day: 'Sun', pain: 2 },
]

export const monthlyTrendData = Array.from({ length: 30 }, (_, i) => {
  // Generate a gradual improving trend with some noise
  const progress = i / 30
  const basePain = 7 - (progress * 5) // Starts around 7, ends around 2
  const noise = (Math.random() * 2) - 1 // +/- 1
  return { 
    day: `Day ${i + 1}`, 
    pain: Math.max(0, Math.min(10, Math.round((basePain + noise) * 10) / 10)) 
  }
})

export type ExerciseItem = {
  id: string
  label: string
  done: boolean
}

export const exerciseChecklist: ExerciseItem[] = [
  { id: 'e1', label: 'Morning knee stretches (10 min)', done: true },
  { id: 'e2', label: 'Gentle walk (20 min)', done: true },
  { id: 'e3', label: 'Range-of-motion routine', done: true },
  { id: 'e4', label: 'Swimming or water exercise', done: false },
  { id: 'e5', label: 'Evening relaxation & breathing', done: false },
]

export const jointLocations = [
  'Right Knee',
  'Left Knee',
  'Right Hip',
  'Left Hip',
  'Right Hand',
  'Left Hand',
  'Lower Spine',
  'Neck',
  'Right Shoulder',
  'Left Shoulder',
]

// JournalEntry and ChatMessage are now canonical in lib/types/assessment.ts
// kept as re-exports above for backwards compatibility.

/** @deprecated use getJournalEntries() from lib/api/journal instead */
export const initialJournalEntries = [
  { id: 'j1', date: 'Yesterday', painLevel: 3, location: 'Right Knee', notes: 'Mild stiffness in the morning, eased after a short walk.', sentiment: 'neutral' as const },
  { id: 'j2', date: '2 days ago', painLevel: 4, location: 'Right Knee', notes: 'Some discomfort climbing stairs but manageable.', sentiment: 'neutral' as const },
  { id: 'j3', date: '3 days ago', painLevel: 7, location: 'Left Hip', notes: 'Difficult day, pain interrupted sleep. Rested more than usual.', sentiment: 'neutral' as const },
]

export const publicBotGreeting: Record<Language, string> = {
  en: "Hello! I'm your Osteoarthritis education assistant. Ask me anything about OA symptoms, exercise, or diet. Note: I provide general information, not medical advice.",
  hi: 'नमस्ते! मैं आपका ऑस्टियोआर्थराइटिस शिक्षा सहायक हूँ। OA के लक्षण, व्यायाम या आहार के बारे में कुछ भी पूछें। ध्यान दें: मैं सामान्य जानकारी देता हूँ, चिकित्सा सलाह नहीं।',
  pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਓਸਟੀਓਆਰਥਰਾਈਟਿਸ ਸਿੱਖਿਆ ਸਹਾਇਕ ਹਾਂ। OA ਦੇ ਲੱਛਣ, ਕਸਰਤ ਜਾਂ ਖੁਰਾਕ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ। ਧਿਆਨ ਦਿਓ: ਮੈਂ ਆਮ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹਾਂ, ਡਾਕਟਰੀ ਸਲਾਹ ਨਹੀਂ।',
  bn: 'নমস্কার! আমি আপনার অস্টিওআর্থ্রাইটিস শিক্ষা সহায়ক। OA এর লক্ষণ, ব্যায়াম বা খাদ্য সম্পর্কে যেকোনো প্রশ্ন করুন। দ্রষ্টব্য: আমি সাধারণ তথ্য দিই, চিকিৎসা পরামর্শ নয়।',
  as: 'নমস্কাৰ! আমি আপোনাৰ অষ্টিঅৰ্থ্ৰাইটিছ শিক্ষা সহায়ক। OA ৰ লক্ষণ, ব্যায়াম বা আহাৰ সম্পৰ্কে যিকোনো প্ৰশ্ন কৰক। মনত ৰাখক: আমি সাধাৰণ তথ্য দিওঁ, চিকিৎসা পৰামৰ্শ নহয়।',
}

export const publicBotReplies: Record<Language, string[]> = {
  en: [
    'Great question. Staying active with low-impact exercise like walking or swimming helps strengthen the muscles around your joints and can reduce OA pain over time.',
    'For joint-friendly nutrition, focus on omega-3 rich foods, colourful vegetables, and maintaining a healthy weight to reduce pressure on your joints.',
    'Morning stiffness is very common with OA. Gentle stretching and gradual movement usually helps. If it lasts longer than an hour, consider consulting a professional.',
  ],
  hi: [
    'बढ़िया सवाल। चलने या तैराकी जैसे कम प्रभाव वाले व्यायाम से जोड़ों के आसपास की मांसपेशियाँ मजबूत होती हैं और OA का दर्द कम हो सकता है।',
    'जोड़ों के लिए अच्छे पोषण हेतु ओमेगा-3 युक्त भोजन, रंगीन सब्जियाँ खाएँ और स्वस्थ वजन बनाए रखें।',
    'सुबह की जकड़न OA में आम है। हल्की स्ट्रेचिंग मदद करती है। यदि यह एक घंटे से अधिक रहे तो पेशेवर से सलाह लें।',
  ],
  pa: [
    'ਵਧੀਆ ਸਵਾਲ। ਤੁਰਨ ਜਾਂ ਤੈਰਾਕੀ ਵਰਗੀ ਘੱਟ-ਪ੍ਰਭਾਵ ਵਾਲੀ ਕਸਰਤ ਜੋੜਾਂ ਦੇ ਆਲੇ-ਦੁਆਲੇ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰਦੀ ਹੈ।',
    'ਜੋੜਾਂ ਲਈ ਚੰਗੀ ਖੁਰਾਕ ਵਾਸਤੇ ਓਮੇਗਾ-3 ਵਾਲਾ ਭੋਜਨ, ਰੰਗੀਨ ਸਬਜ਼ੀਆਂ ਖਾਓ ਅਤੇ ਸਿਹਤਮੰਦ ਭਾਰ ਰੱਖੋ।',
    'ਸਵੇਰ ਦੀ ਅਕੜਨ OA ਵਿੱਚ ਆਮ ਹੈ। ਹਲਕੀ ਸਟ੍ਰੈਚਿੰਗ ਮਦਦ ਕਰਦੀ ਹੈ। ਜੇ ਇਹ ਇੱਕ ਘੰਟੇ ਤੋਂ ਵੱਧ ਰਹੇ ਤਾਂ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
  ],
  bn: [
    'চমৎকার প্রশ্ন। হাঁটা বা সাঁতারের মতো কম-প্রভাবের ব্যায়াম জয়েন্টের চারপাশের পেশি শক্তিশালী করে এবং OA এর ব্যথা কমাতে সাহায্য করে।',
    'জয়েন্ট-বান্ধব পুষ্টির জন্য ওমেগা-৩ সমৃদ্ধ খাবার, রঙিন শাকসবজি খান এবং সুস্থ ওজন বজায় রাখুন।',
    'সকালের জড়তা OA তে খুব সাধারণ। মৃদু স্ট্রেচিং সাধারণত সাহায্য করে।',
  ],
  as: [
    'ভাল প্ৰশ্ন। খোজ কঢ়া বা সাঁতোৰৰ দৰে কম-প্ৰভাৱৰ ব্যায়ামে গাঁঠিৰ চাৰিওফালৰ পেশীবোৰ শক্তিশালী কৰে।',
    'গাঁঠি-বন্ধুত্বপূৰ্ণ পুষ্টিৰ বাবে ওমেগা-৩ সমৃদ্ধ খাদ্য, ৰঙীন পাচলি খাওক আৰু স্বাস্থ্যকৰ ওজন বজাই ৰাখক।',
    'ৰাতিপুৱাৰ কঠিনতা OA ত সাধাৰণ। মৃদু ষ্ট্ৰেচিংয়ে সাধাৰণতে সহায় কৰে।',
  ],
}

/** @deprecated use sendPersonalChatMessage() from lib/api/chat instead */
export const personalBotReplies: string[] = [
  "I can see from your journal that yesterday was tough with your right knee. That's completely valid to feel frustrated. Have you been able to do your gentle stretches today?",
  "You've been so consistent with your walks this week, and your pain trend is actually improving. That's a real achievement worth celebrating.",
  "It sounds like you're carrying a lot right now. Remember, some days are harder than others with OA, and resting when you need to is part of managing well, not giving up.",
]

// ─── WOMAC / KOOS representative question set ─────────────────────────────────
// 12 questions across 3 subscales. Scale: 0 = none, 4 = extreme.
// PLACEHOLDER: Match to full WOMAC (24 items) or KOOS (42 items) when clinically validated.

export const womacQuestions: WomacKoosQuestion[] = [
  // Pain subscale
  { id: 'q-p1', subscale: 'pain', text: 'How much pain do you experience when walking on a flat surface?' },
  { id: 'q-p2', subscale: 'pain', text: 'How much pain do you have going up or down stairs?' },
  { id: 'q-p3', subscale: 'pain', text: 'How much pain do you experience at night while in bed?' },
  { id: 'q-p4', subscale: 'pain', text: 'How much pain do you have when sitting or lying?' },
  // Stiffness subscale
  { id: 'q-s1', subscale: 'stiffness', text: 'How severe is your stiffness just after waking up in the morning?' },
  { id: 'q-s2', subscale: 'stiffness', text: 'How severe is your stiffness after sitting, lying, or resting later in the day?' },
  { id: 'q-s3', subscale: 'stiffness', text: 'Do you notice joint swelling or a feeling of tightness?' },
  { id: 'q-s4', subscale: 'stiffness', text: 'How long does morning stiffness typically last?' },
  // Function subscale
  { id: 'q-f1', subscale: 'function', text: 'How much difficulty do you have descending stairs?' },
  { id: 'q-f2', subscale: 'function', text: 'How much difficulty do you have rising from sitting?' },
  { id: 'q-f3', subscale: 'function', text: 'How much difficulty do you have with heavy domestic duties (moving heavy boxes, scrubbing floors)?' },
  { id: 'q-f4', subscale: 'function', text: 'How much difficulty do you have getting in and out of a vehicle?' },
]

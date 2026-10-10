import type { Language } from './context'

export interface FunctionalImpactItem {
  short: string
  description: string
  category: 'mild' | 'moderate' | 'severe'
  color: string
}

export interface TriLayerDictionary {
  // Page Header
  badge: string
  title: string
  subtitle: string

  // Stepper Tabs
  tab1: string
  tab2: string
  tab3: string
  recommended: string
  selfReported: string
  computerVision: string
  radiologyBadge: string

  // Layer 1
  layer1Title: string
  layer1Subtitle: string
  painSliderLabel: string
  painSliderHint: string
  functionalImpactLevels: Record<number, FunctionalImpactItem>
  locationLabel: string
  additionalQuestionsTitle: string
  stiffnessLabel: string
  stiffnessOptions: { id: string; label: string }[]
  crepitusLabel: string
  crepitusOptions: { id: string; label: string }[]
  weightBearingLabel: string
  weightBearingOptions: { id: string; label: string }[]
  notesLabel: string
  notesPlaceholder: string
  saveEntry: string
  saved: string
  continueToLayer2: string

  // Layer 2
  layer2Title: string
  layer2Subtitle: string
  backToLayer1: string
  saveLayer1And2: string
  proceedToLayer3: string

  // Layer 3
  layer3Title: string
  layer3Subtitle: string
  safeScopeVerdict: string
  radiologyAdvisedVerdict: string
  hasXrayQuestion: string
  hasXrayYes: string
  hasXrayYesSub: string
  hasXrayNo: string
  hasXrayNoSub: string
  uploadLabel: string
  browseOrPhotograph: string
  tooltipSectionHeader: string
  tooltipTip: string
  requisitionTitle: string
  requisitionIntro: string
  requestedProtocolTitle: string
  protocolBullet1: string
  protocolBullet2: string
  protocolBullet3: string
  combinedStatusTitle: string
  layer1Pill: string
  layer2Pill: string
  layer3Pill: string
  backToLayer2: string
  saveCompleteJournal: string

  // Recent Entries Sidebar
  recentEntries: string
  triLayerLogs: string
  relativeDates: Record<string, string>
  locationsMap: Record<string, string>
  seedNotes: Record<string, string>
}

export const TRI_LAYER_DICTIONARIES: Record<Language, TriLayerDictionary> = {
  // ── English ───────────────────────────────────────────────────────────────
  en: {
    badge: '3-Layer Clinical Triage Architecture',
    title: 'Pain Health Journal',
    subtitle: 'Log how you feel today. Follow the 3-Layer Screening: Sensation & Symptoms → Live YOLO Mobility → Radiological Evaluation.',
    tab1: 'Layer 1: Sensation & Symptoms',
    tab2: 'Layer 2: Live YOLO Mobility',
    tab3: 'Layer 3: Radiological Data',
    recommended: 'Recommended',
    selfReported: 'Self-Reported',
    computerVision: 'Computer Vision',
    radiologyBadge: 'Radiology',

    layer1Title: 'Layer 1: Sensation & Functional Impact',
    layer1Subtitle: 'Assess real-world functional limitations and joint sensations.',
    painSliderLabel: 'Pain Level / Functional Impact',
    painSliderHint: 'Slide from 1 to 10 to calibrate daily functional ability',
    functionalImpactLevels: {
      1: { short: 'Normal Function', description: 'Barely noticeable · No interference with daily walking or routines.', category: 'mild', color: 'text-emerald-500' },
      2: { short: 'Mild Ache', description: 'Minor ache after heavy exertion · Completely normal functional ability.', category: 'mild', color: 'text-emerald-500' },
      3: { short: 'Manageable Discomfort', description: 'Mild discomfort · Noticeable occasionally but easily ignored during activity.', category: 'mild', color: 'text-emerald-600' },
      4: { short: 'Noticeable Limp', description: 'Noticeable limp · I can walk, but I have a noticeable limp or hesitation.', category: 'moderate', color: 'text-amber-500' },
      5: { short: 'Stair / Standing Pause', description: 'Moderate impact · Climbing stairs or standing >15 mins requires frequent pauses.', category: 'moderate', color: 'text-amber-600' },
      6: { short: 'Bending & Squat Barrier', description: 'Substantial difficulty · Hard to put on shoes, socks, or bend down to pick up objects.', category: 'moderate', color: 'text-orange-500' },
      7: { short: 'Severe Stair Barrier', description: 'Severe barrier · Pain prevents me from climbing stairs entirely or walking a block.', category: 'severe', color: 'text-orange-600' },
      8: { short: 'Sleep & Self-Care Disrupted', description: 'High functional loss · Sleep and basic self-care are frequently disrupted by sharp pain.', category: 'severe', color: 'text-destructive' },
      9: { short: 'Weight-Bearing Incapacity', description: 'Near-total incapacity · Unable to bear weight on joint without cane, crutches, or support.', category: 'severe', color: 'text-destructive' },
      10: { short: 'Bedridden / Immobilized', description: 'Bedridden / immobilized · Unbearable, agonizing pain even when resting completely still.', category: 'severe', color: 'text-destructive' },
    },
    locationLabel: 'Joint Location',
    additionalQuestionsTitle: 'Additional Joint Sensation Questions',
    stiffnessLabel: 'Morning Stiffness Duration',
    stiffnessOptions: [
      { id: 'none', label: '< 15 mins' },
      { id: 'short', label: '15–30 mins' },
      { id: 'moderate', label: '30–60 mins' },
      { id: 'long', label: '> 60 mins' },
    ],
    crepitusLabel: 'Joint Crepitus (Cracking / Grinding Sensation)',
    crepitusOptions: [
      { id: 'none', label: 'None' },
      { id: 'occasional', label: 'Occasional Pop' },
      { id: 'constant', label: 'Grating / Crunch' },
    ],
    weightBearingLabel: 'Primary Weight-Bearing Difficulty',
    weightBearingOptions: [
      { id: 'none', label: 'None' },
      { id: 'stairs', label: 'Stairs' },
      { id: 'standing', label: 'Standing >15m' },
      { id: 'every-step', label: 'Every Step' },
    ],
    notesLabel: 'Symptoms & Notes',
    notesPlaceholder: 'e.g. Mild stiffness in the morning, eased after a short walk…',
    saveEntry: 'Save Entry',
    saved: 'Saved',
    continueToLayer2: 'Continue to Layer 2: Live YOLO Mobility',

    layer2Title: 'Layer 2: Intelligent YOLO Video Guided Capture',
    layer2Subtitle: 'Align your body inside the dynamic silhouette for automated video capture of {joint}.',
    backToLayer1: '← Back to Layer 1 (Sensation)',
    saveLayer1And2: 'Save Journal (Layers 1 & 2)',
    proceedToLayer3: 'Proceed to Layer 3 (Radiology)',

    layer3Title: 'Layer 3: Radiological Evaluation & Tooltips',
    layer3Subtitle: 'X-ray imaging analysis with plain-language micro-popups for clinical terms.',
    safeScopeVerdict: 'Layer 2 Verdict: Safe Scope (Conservative Routine)',
    radiologyAdvisedVerdict: 'Layer 2 Verdict: Radiography Advised (Elevated Score {score}/10)',
    hasXrayQuestion: 'Do you have recent X-ray films or digital scans for {joint}?',
    hasXrayYes: 'Yes, I have an X-ray',
    hasXrayYesSub: 'Upload file or snap film',
    hasXrayNo: 'No X-ray yet',
    hasXrayNoSub: 'Generate doctor requisition',
    uploadLabel: 'Upload X-ray scan or take photo of film',
    browseOrPhotograph: 'Browse or Photograph',
    tooltipSectionHeader: 'Interactive Radiographic Markers & Glossary Tooltips:',
    tooltipTip: 'Tip: Click or hover any underlined term above for immediate plain-language translations.',
    requisitionTitle: 'Clinical Radiography Requisition Guidance',
    requisitionIntro: 'Based on your Layer 1 Sensation Score ({pain}/10) and Layer 2 Mobility Score ({score}/10), take this summary to your physician or primary health center:',
    requestedProtocolTitle: 'Requested Protocol:',
    protocolBullet1: '• Weight-bearing bilateral standing AP & Lateral views of {joint}',
    protocolBullet2: '• Skyline / Sunrise view to assess patellofemoral joint cartilage',
    protocolBullet3: '• Clinical query: Evaluate for Osteophytes and Joint Space Narrowing (JSN)',
    combinedStatusTitle: 'Tri-Layer Combined Status',
    layer1Pill: 'Layer 1: {pain}/10 Impact',
    layer2Pill: 'Layer 2: {val}',
    layer3Pill: 'Layer 3: {val}',
    backToLayer2: '← Back to Layer 2',
    saveCompleteJournal: 'Save Complete Tri-Layer Journal',

    recentEntries: 'Recent Entries',
    triLayerLogs: 'Tri-Layer Logs',
    relativeDates: {
      'Yesterday': 'Yesterday',
      '2 days ago': '2 days ago',
      '3 days ago': '3 days ago',
      '5 days ago': '5 days ago',
    },
    locationsMap: {
      'Right Knee': 'Right Knee',
      'Left Knee': 'Left Knee',
      'Right Hip': 'Right Hip',
      'Left Hip': 'Left Hip',
      'Lumbar Spine': 'Lumbar Spine',
      'Neck': 'Neck',
    },
    seedNotes: {
      'j1': 'Mild stiffness in the morning, eased after a short walk.',
      'j2': 'Some discomfort climbing stairs but manageable.',
      'j3': 'Difficult day, pain interrupted sleep. Rested more than usual.',
      'j4': 'Worst day in weeks. Unbearable pain. Cannot walk without support.',
    },
  },

  // ── Assamese (অসমীয়া) ───────────────────────────────────────────────────
  as: {
    badge: '৩-স্তৰীয় ক্লিনিকেল ট্ৰাইজ আৰ্কিটেকচাৰ',
    title: 'বিষ ডায়েৰী',
    subtitle: 'আজি আপুনি কেনে অনুভৱ কৰিছে সেয়া লগ কৰক। ৩-স্তৰীয় পৰীক্ষা মানক অনুসৰণ কৰক: অনুভূতি আৰু লক্ষণ → লাইভ YOLO গতিশীলতা → ৰেডিঅ\'লজিকেল মূল্যায়ন।',
    tab1: 'স্তৰ ১: অনুভূতি আৰু লক্ষণ',
    tab2: 'স্তৰ ২: লাইভ YOLO গতিশীলতা',
    tab3: 'স্তৰ ৩: ৰেডিঅ\'লজিকেল তথ্য',
    recommended: 'পৰামৰ্শ দিয়া হৈছে',
    selfReported: 'নিজে জনোৱা',
    computerVision: 'কম্পিউটাৰ ভিজন',
    radiologyBadge: 'ৰেডিঅ\'লজি',

    layer1Title: 'স্তৰ ১: অনুভূতি আৰু কাৰ্যক্ষম প্ৰভাৱ',
    layer1Subtitle: 'দৈনন্দিন কাৰ্যক্ষম সীমাবদ্ধতা আৰু গাঁঠিৰ অনুভূতি মূল্যায়ন কৰক।',
    painSliderLabel: 'বিষৰ মাত্ৰা / কাৰ্যক্ষম প্ৰভাৱ',
    painSliderHint: 'দৈনিক কাৰ্যক্ষম ক্ষমতা জুখিবলৈ ১ ৰ পৰা ১০ লৈ স্লাইড কৰক',
    functionalImpactLevels: {
      1: { short: 'স্বাভাৱিক কাৰ্যক্ষমতা', description: 'প্ৰায় চকুত নপৰে · খোজ কঢ়া বা দৈনন্দিন কামত কোনো বাধা নাই।', category: 'mild', color: 'text-emerald-500' },
      2: { short: 'মৃদু বিষ', description: 'অধিক পৰিশ্ৰমৰ পিছত সামান্য বিষ · সম্পূৰ্ণ স্বাভাৱিক কাম কৰাৰ ক্ষমতা।', category: 'mild', color: 'text-emerald-500' },
      3: { short: 'সহনশীল অস্বস্তি', description: 'মৃদু অস্বস্তি · মাজে মাজে অনুভৱ হয় কিন্তু কামৰ সময়ত সহজে উপেক্ষা কৰিব পাৰি।', category: 'mild', color: 'text-emerald-600' },
      4: { short: 'লক্ষণীয়ভাৱে খোঁৰোৱা', description: 'লক্ষণীয় খোঁৰোৱা · মই খোজ কাঢ়িব পাৰোঁ, কিন্তু স্পষ্টকৈ খোঁৰাওঁ বা ইতস্তত কৰোঁ।', category: 'moderate', color: 'text-amber-500' },
      5: { short: 'চিৰি / থিয় হোৱাত বিৰতি', description: 'মধ্যমীয়া প্ৰভাৱ · চিৰি বগাবলৈ বা ১৫ মিনিটতকৈ অধিক থিয় হ\'বলৈ বাৰে বাৰে জিৰণিৰ প্ৰয়োজন।', category: 'moderate', color: 'text-amber-600' },
      6: { short: 'হোঁকোৰা আৰু বহাত বাধা', description: 'যথেষ্ট অসুবিধা · জোতা-মোজা পিন্ধা বা তললৈ হাউলি বস্তু তুলি লোৱাত টান।', category: 'moderate', color: 'text-orange-500' },
      7: { short: 'চিৰি বগোৱাত গুৰুতৰ বাধা', description: 'গুৰুতৰ বাধা · বিষৰ বাবে চিৰি বগোৱা বা অলপ দূৰ খোজ কঢ়া সম্পূৰ্ণ অসম্ভৱ।', category: 'severe', color: 'text-orange-600' },
      8: { short: 'টোপনি আৰু আত্ম-যত্নত ব্যাঘাত', description: 'উচ্চ কাৰ্যক্ষম ক্ষতি · তীব্ৰ বিষৰ বাবে টোপনি আৰু মৌলিক আত্ম-যত্নত বাধা আহে।', category: 'severe', color: 'text-destructive' },
      9: { short: 'ভাৰ বহনত অক্ষমতা', description: 'প্ৰায় সম্পূৰ্ণ অক্ষম · লাঠি বা আনৰ সহায় অবিহনে গাঁঠিত ভৰ দিব নোৱাৰি।', category: 'severe', color: 'text-destructive' },
      10: { short: 'শয্যাশায়ী / স্থবিৰ', description: 'শয্যাশায়ী / স্থবিৰ · সম্পূৰ্ণ বিশ্ৰামৰ সময়তো অসহনীয়, যন্ত্ৰণাদায়ক বিষ।', category: 'severe', color: 'text-destructive' },
    },
    locationLabel: 'গাঁঠিৰ স্থান',
    additionalQuestionsTitle: 'অতিৰিক্ত গাঁঠিৰ অনুভূতি সম্পৰ্কীয় প্ৰশ্ন',
    stiffnessLabel: 'ৰাতিপুৱাৰ কঠিনতাৰ সময়সীমা',
    stiffnessOptions: [
      { id: 'none', label: '< ১৫ মিনিট' },
      { id: 'short', label: '১৫–৩০ মিনিট' },
      { id: 'moderate', label: '৩০–৬০ মিনিট' },
      { id: 'long', label: '> ৬০ মিনিট' },
    ],
    crepitusLabel: 'গাঁঠিৰ মচমচনি (শব্দ বা ঘঁহনিৰ অনুভূতি)',
    crepitusOptions: [
      { id: 'none', label: 'নাই' },
      { id: 'occasional', label: 'কেতিয়াবা শব্দ হয়' },
      { id: 'constant', label: 'স্পষ্ট ঘঁহনি / মচমচনি' },
    ],
    weightBearingLabel: 'প্ৰাথমিক ভাৰ বহনৰ সমস্যা',
    weightBearingOptions: [
      { id: 'none', label: 'নাই' },
      { id: 'stairs', label: 'চিৰি বগোৱা' },
      { id: 'standing', label: '১৫ মি. অধিক থিয়' },
      { id: 'every-step', label: 'প্ৰতিটো খোজতে' },
    ],
    notesLabel: 'লক্ষণ আৰু টোকা',
    notesPlaceholder: 'যেনে ৰাতিপুৱা কঠিনতা আছিল, খোজ কঢ়াৰ পিছত কমিল…',
    saveEntry: 'এণ্ট্ৰি সংৰক্ষণ কৰক',
    saved: 'সংৰক্ষিত হ\'ল',
    continueToLayer2: 'স্তৰ ২ লৈ যাওক: লাইভ YOLO গতিশীলতা',

    layer2Title: 'স্তৰ ২: ইন্টেলিজেন্ট YOLO ভিডিঅ\' নিৰ্দেশিত কেপচাৰ',
    layer2Subtitle: '{joint} ৰ স্বয়ংক্ৰিয় ভিডিঅ\' কেপচাৰৰ বাবে গতিশীল চিলুৱেটৰ ভিতৰত শৰীৰ সংৰেখিত কৰক।',
    backToLayer1: '← স্তৰ ১ লৈ উভতি যাওক (অনুভূতি)',
    saveLayer1And2: 'ডায়েৰী সংৰক্ষণ কৰক (স্তৰ ১ আৰু ২)',
    proceedToLayer3: 'স্তৰ ৩ লৈ আগবাঢ়ক (ৰেডিঅ\'লজি)',

    layer3Title: 'স্তৰ ৩: ৰেডিঅ\'লজিকেল মূল্যায়ন আৰু টুলটিপসমূহ',
    layer3Subtitle: 'ক্লিনিকেল শব্দৰ সৰল ব্যাখ্যাৰ সৈতে এক্স-ৰে ছবি বিশ্লেষণ।',
    safeScopeVerdict: 'স্তৰ ২ ৰ ফলাফল: সুৰক্ষিত পৰিসৰ (ৰক্ষণশীল যত্ন)',
    radiologyAdvisedVerdict: 'স্তৰ ২ ৰ ফলাফল: ৰেডিঅ\'গ্ৰাফীৰ পৰামৰ্শ (উচ্চ নম্বৰ {score}/১০)',
    hasXrayQuestion: '{joint} ৰ বাবে আপোনাৰ শেহতীয়া এক্স-ৰে বা ডিজিটেল স্কেন আছেনে?',
    hasXrayYes: 'হয়, মোৰ এক্স-ৰে আছে',
    hasXrayYesSub: 'ফাইল আপল\'ড কৰক বা ছবি তোলক',
    hasXrayNo: 'এতিয়ালৈকে এক্স-ৰে নাই',
    hasXrayNoSub: 'চিকিৎসকৰ বাবে ৰিকুইজিচন প্ৰস্তুত কৰক',
    uploadLabel: 'এক্স-ৰে স্কেন আপল\'ড কৰক বা ফিল্মৰ ছবি তোলক',
    browseOrPhotograph: 'বাছক বা ফটো তোলক',
    tooltipSectionHeader: 'ইণ্টাৰেক্টিভ ৰেডিঅ\'গ্ৰাফিক মাৰ্কাৰ আৰু শব্দকোষৰ টুলটিপ:',
    tooltipTip: 'পৰামৰ্শ: তাৎক্ষণিক সৰল অনুবাদৰ বাবে ওপৰৰ যিকোনো আঁক দিয়া শব্দত ক্লিক বা কাৰ্চাৰ ৰাখক।',
    requisitionTitle: 'ক্লিনিকেল ৰেডিঅ\'গ্ৰাফী ৰিকুইজিচন নিৰ্দেশনা',
    requisitionIntro: 'আপোনাৰ স্তৰ ১ অনুভূতি নম্বৰ ({pain}/১০) আৰু স্তৰ ২ গতিশীলতা নম্বৰ ({score}/১০) ৰ ওপৰত ভিত্তি কৰি এই সাৰাংশ আপোনাৰ চিকিৎসক বা প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰলৈ লৈ যাওক:',
    requestedProtocolTitle: 'অনুমোদিত প্ৰট\'কল:',
    protocolBullet1: '• {joint} ৰ ভৰ বহনকাৰী দুয়োফালৰ থিয় হৈ লোৱা AP আৰু Lateral দৃশ্য',
    protocolBullet2: '• পেটেলা আৰু কাৰ্টিলেজ পৰীক্ষাৰ বাবে Skyline / Sunrise ভিউ',
    protocolBullet3: '• ক্লিনিকেল পৰীক্ষা: অষ্টিঅ\'ফাইট আৰু গাঁঠিৰ স্থান সংকুচিত হোৱা (JSN) পৰীক্ষা',
    combinedStatusTitle: '৩-স্তৰীয় একত্ৰিত স্থিতি',
    layer1Pill: 'স্তৰ ১: {pain}/১০ প্ৰভাৱ',
    layer2Pill: 'স্তৰ ২: {val}',
    layer3Pill: 'স্তৰ ৩: {val}',
    backToLayer2: '← স্তৰ ২ লৈ উভতি যাওক',
    saveCompleteJournal: 'সম্পূৰ্ণ ৩-স্তৰীয় ডায়েৰী সংৰক্ষণ কৰক',

    recentEntries: 'শেহতীয়া এণ্ট্ৰিসমূহ',
    triLayerLogs: '৩-স্তৰীয় লগসমূহ',
    relativeDates: {
      'Yesterday': 'কালি',
      '2 days ago': '২ দিন আগতে',
      '3 days ago': '৩ দিন আগতে',
      '5 days ago': '৫ দিন আগতে',
    },
    locationsMap: {
      'Right Knee': 'সোঁ আঁঠু',
      'Left Knee': 'বাঁও আঁঠু',
      'Right Hip': 'সোঁ নিতম্ব',
      'Left Hip': 'বাঁও নিতম্ব',
      'Lumbar Spine': 'কটিদেশীয় মেৰুদণ্ড',
      'Neck': 'ডিঙি',
    },
    seedNotes: {
      'j1': 'ৰাতিপুৱা মৃদু কঠিনতা আছিল, অলপ খোজ কঢ়াৰ পিছত উপশম হ\'ল।',
      'j2': 'চিৰি বগোৱাত কিছু অসুবিধা হৈছিল কিন্তু সহনশীল আছিল।',
      'j3': 'টান দিন আছিল, বিষৰ বাবে টোপনিত ব্যাঘাত ঘটিছিল। স্বাভাৱিকতকৈ অধিক জিৰণি ল\'লো।',
      'j4': 'সপ্তাহৰ আটাইতকৈ বেয়া দিন। অসহনীয় বিষ। সহায় অবিহনে খোজ কাঢ়িব পৰা নাই।',
    },
  },

  // ── Hindi (हिंदी) ────────────────────────────────────────────────────────
  hi: {
    badge: '3-स्तरीय क्लिनिकल ट्राइएज आर्किटेक्चर',
    title: 'दर्द डायरी',
    subtitle: 'आज आप कैसा महसूस कर रहे हैं दर्ज करें। 3-स्तरीय जांच का पालन करें: सनसनी और लक्षण → लाइव YOLO गतिशीलता → रेडियोलॉजिकल मूल्यांकन।',
    tab1: 'स्तर 1: सनसनी और लक्षण',
    tab2: 'स्तर 2: लाइव YOLO गतिशीलता',
    tab3: 'स्तर 3: रेडियोलॉजिकल डेटा',
    recommended: 'अनुशंसित',
    selfReported: 'स्व-रिपोर्ट किया गया',
    computerVision: 'कंप्यूटर विज़न',
    radiologyBadge: 'रेडियोलॉजी',

    layer1Title: 'स्तर 1: सनसनी और कार्यात्मक प्रभाव',
    layer1Subtitle: 'दैनिक कार्यात्मक सीमाओं और जोड़ों की सनसनी का मूल्यांकन करें।',
    painSliderLabel: 'दर्द का स्तर / कार्यात्मक प्रभाव',
    painSliderHint: 'दैनिक कार्यक्षमता जांचने के लिए 1 से 10 तक स्लाइड करें',
    functionalImpactLevels: {
      1: { short: 'सामान्य कार्यक्षमता', description: 'बिल्कुल मामूली · चलने-फिरने या दैनिक दिनचर्या में कोई रुकावट नहीं।', category: 'mild', color: 'text-emerald-500' },
      2: { short: 'हल्का दर्द', description: 'भारी काम के बाद हल्का दर्द · पूरी तरह से सामान्य कार्य क्षमता।', category: 'mild', color: 'text-emerald-500' },
      3: { short: 'सहनीय बेचैनी', description: 'हल्की परेशानी · कभी-कभार महसूस होती है लेकिन काम के दौरान आसानी से अनदेखी की जा सकती है।', category: 'mild', color: 'text-emerald-600' },
      4: { short: 'साफ तौर पर लंगड़ाना', description: 'लंगड़ाहट महसूस होना · मैं चल सकता हूँ, लेकिन चलते समय साफ लंगड़ाता या हिचकिचाता हूँ।', category: 'moderate', color: 'text-amber-500' },
      5: { short: 'सीढ़ी / खड़े रहने में ठहराव', description: 'मध्यम प्रभाव · सीढ़ियां चढ़ने या 15 मिनट से अधिक खड़े रहने पर बार-बार रुकना पड़ता है।', category: 'moderate', color: 'text-amber-600' },
      6: { short: 'झुकने और बैठने में रुकावट', description: 'काफी कठिनाई · जूते-मोज़े पहनना या नीचे झुककर सामान उठाना मुश्किल।', category: 'moderate', color: 'text-orange-500' },
      7: { short: 'सीढ़ियों पर गंभीर रुकावट', description: 'गंभीर बाधा · दर्द के कारण सीढ़ियां चढ़ना या एक ब्लॉक चलना पूरी तरह से बंद हो गया है।', category: 'severe', color: 'text-orange-600' },
      8: { short: 'नींद और देखभाल में बाधा', description: 'उच्च कार्यात्मक नुकसान · तेज दर्द के कारण नींद और बुनियादी देखभाल में लगातार बाधा।', category: 'severe', color: 'text-destructive' },
      9: { short: 'भार उठाने में असमर्थता', description: 'लगभग पूरी तरह असमर्थ · छड़ी या सहारे के बिना जोड़ पर वजन नहीं डाला जा सकता।', category: 'severe', color: 'text-destructive' },
      10: { short: 'बिस्तर पर लेटे रहना', description: 'बिस्तर पर स्थिर · पूरी तरह से आराम करने पर भी असहनीय, तीव्र दर्द।', category: 'severe', color: 'text-destructive' },
    },
    locationLabel: 'जोड़ का स्थान',
    additionalQuestionsTitle: 'अतिरिक्त जोड़ सनसनी प्रश्न',
    stiffnessLabel: 'सुबह की अकड़न की अवधि',
    stiffnessOptions: [
      { id: 'none', label: '< 15 मिनट' },
      { id: 'short', label: '15–30 मिनट' },
      { id: 'moderate', label: '30–60 मिनट' },
      { id: 'long', label: '> 60 मिनट' },
    ],
    crepitusLabel: 'जोड़ों की चरचराहट (चटकने या घिसने की आवाज)',
    crepitusOptions: [
      { id: 'none', label: 'कोई नहीं' },
      { id: 'occasional', label: 'कभी-कभार आवाज' },
      { id: 'constant', label: 'लगातार घिसाव / चरचराहट' },
    ],
    weightBearingLabel: 'वजन सहने में मुख्य कठिनाई',
    weightBearingOptions: [
      { id: 'none', label: 'कोई नहीं' },
      { id: 'stairs', label: 'सीढ़ियां' },
      { id: 'standing', label: '15 मिनट से अधिक खड़ा रहना' },
      { id: 'every-step', label: 'हर कदम पर' },
    ],
    notesLabel: 'लक्षण और नोट्स',
    notesPlaceholder: 'जैसे सुबह अकड़न थी, थोड़ी सैर के बाद कम हो गई…',
    saveEntry: 'एंट्री सहेजें',
    saved: 'सहेजा गया',
    continueToLayer2: 'स्तर 2 पर जाएं: लाइव YOLO गतिशीलता',

    layer2Title: 'स्तर 2: इंटेलिजेंट YOLO वीडियो गाइडेड कैप्चर',
    layer2Subtitle: '{joint} के स्वचालित वीडियो कैप्चर के लिए डायनेमिक रूपरेखा के अंदर शरीर को संरेखित करें।',
    backToLayer1: '← स्तर 1 पर वापस (सनसनी)',
    saveLayer1And2: 'डायरी सहेजें (स्तर 1 और 2)',
    proceedToLayer3: 'स्तर 3 पर आगे बढ़ें (रेडियोलॉजी)',

    layer3Title: 'स्तर 3: रेडियोलॉजिकल मूल्यांकन और टूलटिप्स',
    layer3Subtitle: 'सरल भाषा में मेडिकल शब्दों के साथ एक्स-रे छवि विश्लेषण।',
    safeScopeVerdict: 'स्तर 2 परिणाम: सुरक्षित दायरा (रूढ़िवादी देखभाल)',
    radiologyAdvisedVerdict: 'स्तर 2 परिणाम: रेडियोग्राफी की सलाह (बढ़ा हुआ स्कोर {score}/10)',
    hasXrayQuestion: 'क्या आपके पास {joint} के लिए हाल के एक्स-रे या डिजिटल स्कैन हैं?',
    hasXrayYes: 'हाँ, मेरे पास एक्स-रे है',
    hasXrayYesSub: 'फ़ाइल अपलोड करें या फोटो लें',
    hasXrayNo: 'अभी एक्स-रे नहीं है',
    hasXrayNoSub: 'डॉक्टर के लिए पर्ची तैयार करें',
    uploadLabel: 'एक्स-रे स्कैन अपलोड करें या फिल्म की फोटो लें',
    browseOrPhotograph: 'चुनें या फोटो खींचें',
    tooltipSectionHeader: 'इंटरैक्टिव रेडियोग्राफिक मार्कर और शब्दावली टूलटिप्स:',
    tooltipTip: 'सुझाव: तत्काल सरल अनुवाद के लिए ऊपर रेखांकित किसी भी शब्द पर क्लिक करें या कर्सर ले जाएं।',
    requisitionTitle: 'क्लिनिकल रेडियोग्राफी मांग पत्र मार्गदर्शन',
    requisitionIntro: 'आपके स्तर 1 सनसनी स्कोर ({pain}/10) और स्तर 2 गतिशीलता स्कोर ({score}/10) के आधार पर, यह सारांश अपने डॉक्टर या स्वास्थ्य केंद्र ले जाएं:',
    requestedProtocolTitle: 'अनुरोधित प्रोटोकॉल:',
    protocolBullet1: '• {joint} का वजन सहते हुए दोनों तरफ खड़े होकर लिया गया AP और Lateral दृश्य',
    protocolBullet2: '• कार्टिलेज की स्थिति जानने के लिए Skyline / Sunrise व्यू',
    protocolBullet3: '• क्लिनिकल जांच: ऑस्टियोफाइट्स और जोड़ों का स्थान कम होना (JSN)',
    combinedStatusTitle: '3-स्तरीय एकीकृत स्थिति',
    layer1Pill: 'स्तर 1: {pain}/10 प्रभाव',
    layer2Pill: 'स्तर 2: {val}',
    layer3Pill: 'स्तर 3: {val}',
    backToLayer2: '← स्तर 2 पर वापस',
    saveCompleteJournal: 'पूरी 3-स्तरीय डायरी सहेजें',

    recentEntries: 'हाल की प्रविष्टियां',
    triLayerLogs: '3-स्तरीय लॉग',
    relativeDates: {
      'Yesterday': 'कल',
      '2 days ago': '2 दिन पहले',
      '3 days ago': '3 दिन पहले',
      '5 days ago': '5 दिन पहले',
    },
    locationsMap: {
      'Right Knee': 'दायां घुटना',
      'Left Knee': 'बायां घुटना',
      'Right Hip': 'दायां कूल्हा',
      'Left Hip': 'बायां कूल्हा',
      'Lumbar Spine': 'कमर की रीढ़',
      'Neck': 'गर्दन',
    },
    seedNotes: {
      'j1': 'सुबह हल्का कड़ापन था, थोड़ी सैर के बाद ठीक हो गया।',
      'j2': 'सीढ़ियां चढ़ते समय कुछ तकलीफ हुई लेकिन सहनीय थी।',
      'j3': 'कठिन दिन रहा, दर्द से नींद खुली। सामान्य से ज्यादा आराम किया।',
      'j4': 'हफ़्तों में सबसे खराब दिन। असहनीय दर्द। बिना सहारे के नहीं चल सकता।',
    },
  },

  // ── Bengali (বাংলা) ───────────────────────────────────────────────────────
  bn: {
    badge: '৩-স্তরীয় ক্লিনিক্যাল ট্রায়াজ আর্কিটেকচার',
    title: 'ব্যথার ডায়েরি',
    subtitle: 'আজ আপনি কেমন বোধ করছেন তা লগ করুন। ৩-স্তরীয় স্ক্রিনিং অনুসরণ করুন: অনুভূতি এবং লক্ষণ → লাইভ YOLO গতিশীলতা → রেডিওলজিক্যাল মূল্যায়ন।',
    tab1: 'স্তর ১: অনুভূতি ও লক্ষণ',
    tab2: 'স্তর ২: লাইভ YOLO গতিশীলতা',
    tab3: 'স্তর ৩: রেডিওলজিক্যাল তথ্য',
    recommended: 'সুপারিশকৃত',
    selfReported: 'স্ব-প্রতিবেদিত',
    computerVision: 'কম্পিউটার ভিশন',
    radiologyBadge: 'রেডিওলজি',

    layer1Title: 'স্তর ১: অনুভূতি ও কর্মক্ষম প্রভাব',
    layer1Subtitle: 'দৈনন্দিন কাজের সীমাবদ্ধতা এবং জয়েন্টের অনুভূতি মূল্যায়ন করুন।',
    painSliderLabel: 'ব্যথার মাত্রা / কর্মক্ষম প্রভাব',
    painSliderHint: 'দৈনিক কর্মক্ষমতা পরিমাপ করতে ১ থেকে ১০ স্লাইড করুন',
    functionalImpactLevels: {
      1: { short: 'স্বাভাবিক কর্মক্ষমতা', description: 'খুব সামান্য · হাঁটাচলা বা দৈনন্দিন কাজে কোনো বাধা নেই।', category: 'mild', color: 'text-emerald-500' },
      2: { short: 'হালকা ব্যথা', description: 'কঠোর পরিশ্রমের পর সামান্য ব্যথা · সম্পূর্ণ স্বাভাবিক কাজ করার ক্ষমতা।', category: 'mild', color: 'text-emerald-500' },
      3: { short: 'সহনীয় অস্বস্তি', description: 'হালকা অস্বস্তি · মাঝে মাঝে অনুভূত হয় কিন্তু কাজের সময় সহজেই উপেক্ষা করা যায়।', category: 'mild', color: 'text-emerald-600' },
      4: { short: 'স্পষ্ট খুঁড়িয়ে চলা', description: 'স্পষ্ট খোঁড়ানো · আমি হাঁটতে পারি, তবে চলার সময় স্পষ্ট খুঁড়িয়ে চলি বা দ্বিধা করি।', category: 'moderate', color: 'text-amber-500' },
      5: { short: 'সিঁড়ি / দাঁড়ানোয় বিরতি', description: 'মাঝারি প্রভাব · সিঁড়ি বেয়ে উঠতে বা ১৫ মিনিটের বেশি দাঁড়াতে ঘন ঘন বিশ্রামের প্রয়োজন।', category: 'moderate', color: 'text-amber-600' },
      6: { short: 'ঝোঁকা এবং বসায় বাধা', description: 'যথেষ্ট অসুবিধা · জুতো-মোজা পরা বা নিচে ঝুঁকে জিনিস তোলা কঠিন।', category: 'moderate', color: 'text-orange-500' },
      7: { short: 'সিঁড়িতে গুরুতর বাধা', description: 'গুরুতর বাধা · ব্যথার কারণে সিঁড়ি বেয়ে ওঠা বা একটু হাঁটা একেবারেই অসম্ভব।', category: 'severe', color: 'text-orange-600' },
      8: { short: 'ঘুম ও নিজের যত্নে ব্যাঘাত', description: 'উচ্চ কর্মক্ষম ক্ষতি · তীব্র ব্যথার কারণে ঘুম এবং মৌলিক আত্ম-যত্নে ঘন ঘন বাধা আসে।', category: 'severe', color: 'text-destructive' },
      9: { short: 'ভার বহনে অক্ষমতা', description: 'প্রায় সম্পূর্ণ অক্ষম · লাঠি বা সাহায্য ছাড়া জয়েন্টে ভর দেওয়া অসম্ভব।', category: 'severe', color: 'text-destructive' },
      10: { short: 'শয্যাশায়ী / নিশ্চল', description: 'শয্যাশায়ী · পুরোপুরি বিশ্রামে থাকলেও অসহ্য, তীব্র যন্ত্রণা।', category: 'severe', color: 'text-destructive' },
    },
    locationLabel: 'জয়েন্টের স্থান',
    additionalQuestionsTitle: 'অতিরিক্ত জয়েন্টের অনুভূতি সংক্রান্ত প্রশ্নাবলী',
    stiffnessLabel: 'সকালের আড়ষ্টতার সময়সীমা',
    stiffnessOptions: [
      { id: 'none', label: '< ১৫ মিনিট' },
      { id: 'short', label: '১৫–৩০ মিনিট' },
      { id: 'moderate', label: '৩০–৬০ মিনিট' },
      { id: 'long', label: '> ৬০ মিনিট' },
    ],
    crepitusLabel: 'জয়েন্টের ক্যাচক্যাচ শব্দ (ঘর্ষণ বা চটপট অনুভূতি)',
    crepitusOptions: [
      { id: 'none', label: 'কিছুই নেই' },
      { id: 'occasional', label: 'মাঝে মাঝে শব্দ' },
      { id: 'constant', label: 'স্পষ্ট ঘর্ষণ / ক্যাচক্যাচ' },
    ],
    weightBearingLabel: 'প্রাথমিক ভর বহনের অসুবিধা',
    weightBearingOptions: [
      { id: 'none', label: 'কিছুই নেই' },
      { id: 'stairs', label: 'সিঁড়ি' },
      { id: 'standing', label: '১৫ মিনিটের বেশি দাঁড়ানো' },
      { id: 'every-step', label: 'প্রতিটি পদক্ষেপে' },
    ],
    notesLabel: 'লক্ষণ ও নোট',
    notesPlaceholder: 'যেমন সকালে শক্ত ভাব ছিল, কিছুক্ষণ হাঁটার পর কমল…',
    saveEntry: 'সংরক্ষণ করুন',
    saved: 'সংরক্ষিত',
    continueToLayer2: 'স্তর ২-এ এগিয়ে যান: লাইভ YOLO গতিশীলতা',

    layer2Title: 'স্তর ২: ইন্টেলিজেন্ট YOLO ভিডিও গাইডেড ক্যাপচার',
    layer2Subtitle: '{joint}-এর স্বয়ংক্রিয় ভিডিও ক্যাপচারের জন্য গতিশীল রূপরেখার ভেতরে শরীর অবস্থান করান।',
    backToLayer1: '← স্তর ১-এ ফিরে যান (অনুভূতি)',
    saveLayer1And2: 'ডায়েরি সংরক্ষণ করুন (স্তর ১ ও ২)',
    proceedToLayer3: 'স্তর ৩-এ এগিয়ে যান (রেডিওলজি)',

    layer3Title: 'স্তর ৩: রেডিওলজিক্যাল মূল্যায়ন ও টুলটিপস',
    layer3Subtitle: 'ক্লিনিক্যাল শব্দের সহজ ব্যাখ্যার সাথে এক্স-রে ছবি বিশ্লেষণ।',
    safeScopeVerdict: 'স্তর ২ ফলাফল: নিরাপদ পরিসর (রক্ষণশীল যত্ন)',
    radiologyAdvisedVerdict: 'স্তর ২ ফলাফল: রেডিওগ্রাফির পরামর্শ (উচ্চ স্কোর {score}/১০)',
    hasXrayQuestion: '{joint}-এর সাম্প্রতিক এক্স-রে বা ডিজিটাল স্ক্যান আছে কি?',
    hasXrayYes: 'হ্যাঁ, আমার এক্স-রে আছে',
    hasXrayYesSub: 'ফাইল আপলোড করুন বা ছবি তুলুন',
    hasXrayNo: 'এখনও এক্স-রে নেই',
    hasXrayNoSub: 'ডাক্তারের জন্য রিকুইজিশন তৈরি করুন',
    uploadLabel: 'এক্স-রে স্ক্যান আপলোড করুন বা ফিল্মের ছবি তুলুন',
    browseOrPhotograph: 'বাছাই করুন বা ছবি তুলুন',
    tooltipSectionHeader: 'ইন্টারেক্টিভ রেডিওগ্রাফিক মার্কার ও শব্দকোষ টুলটিপ:',
    tooltipTip: 'পরামর্শ: তাৎক্ষণিক সহজ ব্যাখ্যার জন্য উপরের যেকোনো আন্ডারলাইন করা শব্দে ক্লিক বা কার্সার রাখুন।',
    requisitionTitle: 'ক্লিনিক্যাল রেডিওগ্রাফি রিকুইজিশন নির্দেশিকা',
    requisitionIntro: 'আপনার স্তর ১ অনুভূতি স্কোর ({pain}/১০) এবং স্তর ২ গতিশীলতা স্কোর ({score}/১০)-এর ভিত্তিতে এই সারাংশটি আপনার চিকিৎসককে দেখান:',
    requestedProtocolTitle: 'অনুরোধকৃত প্রোটোকল:',
    protocolBullet1: '• {joint}-এর ওজন বহনকারী উভয় পাশের দাঁড়িয়ে নেওয়া AP ও Lateral ভিউ',
    protocolBullet2: '• কার্টিলেজের ক্ষয় মূল্যায়নের জন্য Skyline / Sunrise ভিউ',
    protocolBullet3: '• ক্লিনিক্যাল অনুসন্ধান: অস্টিওফাইট ও জয়েন্ট স্পেস সংকীর্ণতা (JSN) মূল্যায়ন',
    combinedStatusTitle: '৩-স্তরীয় সমন্বিত অবস্থা',
    layer1Pill: 'স্তর ১: {pain}/১০ প্রভাব',
    layer2Pill: 'স্তর ২: {val}',
    layer3Pill: 'স্তর ৩: {val}',
    backToLayer2: '← স্তর ২-এ ফিরে যান',
    saveCompleteJournal: 'সম্পূর্ণ ৩-স্তরীয় ডায়েরি সংরক্ষণ করুন',

    recentEntries: 'সাম্প্রতিক এন্ট্রি',
    triLayerLogs: '৩-স্তরীয় লগ',
    relativeDates: {
      'Yesterday': 'গতকাল',
      '2 days ago': '২ দিন আগে',
      '3 days ago': '৩ দিন আগে',
      '5 days ago': '৫ দিন আগে',
    },
    locationsMap: {
      'Right Knee': 'ডান হাঁটু',
      'Left Knee': 'বাম হাঁটু',
      'Right Hip': 'ডান নিতম্ব',
      'Left Hip': 'বাম নিতম্ব',
      'Lumbar Spine': 'কোমরের মেরুদণ্ড',
      'Neck': 'ঘাড়',
    },
    seedNotes: {
      'j1': 'সকালে সামান্য আড়ষ্টতা ছিল, কিছুক্ষণ হাঁটার পর স্বস্তি মেলে।',
      'j2': 'সিঁড়ি ওঠার সময় কিছুটা অস্বস্তি তবে সহনীয়।',
      'j3': 'কঠিন দিন ছিল, ব্যথায় ঘুম ভেঙে যায়। স্বাভাবিকের চেয়ে বেশি বিশ্রাম নিয়েছি।',
      'j4': 'কয়েক সপ্তাহের মধ্যে সবচেয়ে খারাপ দিন। অসহ্য যন্ত্রণা। সাহায্য ছাড়া হাঁটতে পারছি না।',
    },
  },

  // ── Punjabi (ਪੰਜਾਬੀ) ─────────────────────────────────────────────────────
  pa: {
    badge: '3-ਪੱਧਰੀ ਕਲੀਨਿਕਲ ਟ੍ਰਾਈਏਜ ਆਰਕੀਟੈਕਚਰ',
    title: 'ਦਰਦ ਡਾਇਰੀ',
    subtitle: 'ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ ਦਰਜ ਕਰੋ। 3-ਪੱਧਰੀ ਜਾਂਚ ਦਾ ਪਾਲਣ ਕਰੋ: ਸੰਵੇਦਨਾ ਅਤੇ ਲੱਛਣ → ਲਾਈਵ YOLO ਗਤੀਸ਼ੀਲਤਾ → ਰੇਡੀਓਲੌਜੀਕਲ ਮੁਲਾਂਕਣ।',
    tab1: 'ਪੱਧਰ 1: ਸੰਵੇਦਨਾ ਅਤੇ ਲੱਛਣ',
    tab2: 'ਪੱਧਰ 2: ਲਾਈਵ YOLO ਗਤੀਸ਼ੀਲਤਾ',
    tab3: 'ਪੱਧਰ 3: ਰੇਡੀਓਲੌਜੀਕਲ ਡੇਟਾ',
    recommended: 'ਸਿਫਾਰਸ਼ ਕੀਤੀ ਗਈ',
    selfReported: 'ਸਵੈ-ਰਿਪੋਰਟ ਕੀਤਾ',
    computerVision: 'ਕੰਪਿਊਟਰ ਵਿਜ਼ਨ',
    radiologyBadge: 'ਰੇਡੀਓਲੋਜੀ',

    layer1Title: 'ਪੱਧਰ 1: ਸੰਵੇਦਨਾ ਅਤੇ ਕਾਰਜਸ਼ੀਲ ਪ੍ਰਭਾਵ',
    layer1Subtitle: 'ਰੋਜ਼ਾਨਾ ਕੰਮਾਂ ਦੀਆਂ ਸੀਮਾਵਾਂ ਅਤੇ ਜੋੜਾਂ ਦੀ ਸੰਵੇਦਨਾ ਦਾ ਮੁਲਾਂਕਣ ਕਰੋ।',
    painSliderLabel: 'ਦਰਦ ਦਾ ਪੱਧਰ / ਕਾਰਜਸ਼ੀਲ ਪ੍ਰਭਾਵ',
    painSliderHint: 'ਰੋਜ਼ਾਨਾ ਕਾਰਜਸ਼ੀਲ ਸਮਰੱਥਾ ਮਾਪਣ ਲਈ 1 ਤੋਂ 10 ਤੱਕ ਸਲਾਈਡ ਕਰੋ',
    functionalImpactLevels: {
      1: { short: 'ਸਧਾਰਣ ਕਾਰਜਸ਼ੀਲਤਾ', description: 'ਬਿਲਕੁਲ ਮਾਮੂਲੀ · ਤੁਰਨ ਜਾਂ ਰੋਜ਼ਾਨਾ ਦੇ ਕੰਮਾਂ ਵਿੱਚ ਕੋਈ ਰੁਕਾਵਟ ਨਹੀਂ।', category: 'mild', color: 'text-emerald-500' },
      2: { short: 'ਹਲਕਾ ਦਰਦ', description: 'ਭਾਰੀ ਕੰਮ ਤੋਂ ਬਾਅਦ ਹਲਕਾ ਦਰਦ · ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਧਾਰਣ ਕੰਮ ਕਰਨ ਦੀ ਸਮਰੱਥਾ।', category: 'mild', color: 'text-emerald-500' },
      3: { short: 'ਸਹਿਣਯੋਗ ਬੇਅਰਾਮੀ', description: 'ਹਲਕੀ ਬੇਅਰਾਮੀ · ਕਦੇ-ਕਦਾਈਂ ਮਹਿਸੂਸ ਹੁੰਦੀ ਹੈ ਪਰ ਕੰਮ ਦੌਰਾਨ ਆਸਾਨੀ ਨਾਲ ਨਜ਼ਰਅੰਦਾਜ਼ ਹੋ ਜਾਂਦੀ ਹੈ।', category: 'mild', color: 'text-emerald-600' },
      4: { short: 'ਸਪੱਸ਼ਟ ਲੰਗੜਾਉਣਾ', description: 'ਲੰਗੜਾਉਣਾ ਮਹਿਸੂਸ ਹੋਣਾ · ਮੈਂ ਤੁਰ ਸਕਦਾ ਹਾਂ, ਪਰ ਤੁਰਨ ਵੇਲੇ ਸਪੱਸ਼ਟ ਲੰਗੜਾਉਂਦਾ ਜਾਂ ਝਿਜਕਦਾ ਹਾਂ।', category: 'moderate', color: 'text-amber-500' },
      5: { short: 'ਪੌੜੀਆਂ / ਖੜ੍ਹਨ ਵਿੱਚ ਠਹਿਰਾਅ', description: 'ਦਰਮਿਆਨਾ ਪ੍ਰਭਾਵ · ਪੌੜੀਆਂ ਚੜ੍ਹਨ ਜਾਂ 15 ਮਿੰਟ ਤੋਂ ਵੱਧ ਖੜ੍ਹਨ \'ਤੇ ਵਾਰ-ਵਾਰ ਰੁਕਣਾ ਪੈਂਦਾ ਹੈ।', category: 'moderate', color: 'text-amber-600' },
      6: { short: 'ਝੁਕਣ ਅਤੇ ਬੈਠਣ ਵਿੱਚ ਰੁਕਾਵਟ', description: 'ਕਾਫ਼ੀ ਮੁਸ਼ਕਲ · ਜੁੱਤੇ-ਜੁਰਾਬਾਂ ਪਾਉਣੀਆਂ ਜਾਂ ਹੇਠਾਂ ਝੁਕ ਕੇ ਸਾਮਾਨ ਚੁੱਕਣਾ ਮੁਸ਼ਕਲ।', category: 'moderate', color: 'text-orange-500' },
      7: { short: 'ਪੌੜੀਆਂ \'ਤੇ ਗੰਭੀਰ ਰੁਕਾਵਟ', description: 'ਗੰਭੀਰ ਰੁਕਾਵਟ · ਦਰਦ ਕਾਰਨ ਪੌੜੀਆਂ ਚੜ੍ਹਨਾ ਜਾਂ ਥੋੜ੍ਹਾ ਤੁਰਨਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਬੰਦ ਹੋ ਗਿਆ ਹੈ।', category: 'severe', color: 'text-orange-600' },
      8: { short: 'ਨੀਂਦ ਅਤੇ ਸੰਭਾਲ ਵਿੱਚ ਵਿਘਨ', description: 'ਉੱਚ ਕਾਰਜਸ਼ੀਲ ਨੁਕਸਾਨ · ਤੇਜ਼ ਦਰਦ ਕਾਰਨ ਨੀਂਦ ਅਤੇ ਬੁਨਿਆਦੀ ਸਵੈ-ਸੰਭਾਲ ਵਿੱਚ ਲਗਾਤਾਰ ਰੁਕਾਵਟ।', category: 'severe', color: 'text-destructive' },
      9: { short: 'ਭਾਰ ਚੁੱਕਣ ਵਿੱਚ ਅਸਮਰੱਥਾ', description: 'ਲਗਭਗ ਪੂਰੀ ਤਰ੍ਹਾਂ ਅਸਮਰੱਥ · ਸੋਟੀ ਜਾਂ ਸਹਾਰੇ ਤੋਂ ਬਿਨਾਂ ਜੋੜ \'ਤੇ ਭਾਰ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ।', category: 'severe', color: 'text-destructive' },
      10: { short: 'ਮੰਜੇ \'ਤੇ ਪਏ ਰਹਿਣਾ', description: 'ਮੰਜੇ \'ਤੇ ਸਥਿਰ · ਪੂਰੀ ਤਰ੍ਹਾਂ ਆਰਾਮ ਕਰਨ \'ਤੇ ਵੀ ਅਸਹਿਣਸ਼ੀਲ ਦਰਦ।', category: 'severe', color: 'text-destructive' },
    },
    locationLabel: 'ਜੋੜ ਦੀ ਥਾਂ',
    additionalQuestionsTitle: 'ਵਾਧੂ ਜੋੜ ਸੰਵੇਦਨਾ ਸਵਾਲ',
    stiffnessLabel: 'ਸਵੇਰ ਦੀ ਅਕੜਾਅ ਦੀ ਮਿਆਦ',
    stiffnessOptions: [
      { id: 'none', label: '< 15 ਮਿੰਟ' },
      { id: 'short', label: '15–30 ਮਿੰਟ' },
      { id: 'moderate', label: '30–60 ਮਿੰਟ' },
      { id: 'long', label: '> 60 ਮਿੰਟ' },
    ],
    crepitusLabel: 'ਜੋੜਾਂ ਦੀ ਖੜਕਾਹਟ (ਪਟਾਕੇ ਜਾਂ ਰਗੜ ਦੀ ਆਵਾਜ਼)',
    crepitusOptions: [
      { id: 'none', label: 'ਕੋਈ ਨਹੀਂ' },
      { id: 'occasional', label: 'ਕਦੇ-ਕਦਾਈਂ ਆਵਾਜ਼' },
      { id: 'constant', label: 'ਲਗਾਤਾਰ ਰਗੜ / ਖੜਕਾਹਟ' },
    ],
    weightBearingLabel: 'ਭਾਰ ਸਹਿਣ ਵਿੱਚ ਮੁੱਖ ਮੁਸ਼ਕਲ',
    weightBearingOptions: [
      { id: 'none', label: 'ਕੋਈ ਨਹੀਂ' },
      { id: 'stairs', label: 'ਪੌੜੀਆਂ' },
      { id: 'standing', label: '15 ਮਿੰਟ ਤੋਂ ਵੱਧ ਖੜ੍ਹਾ ਰਹਿਣਾ' },
      { id: 'every-step', label: 'ਹਰ ਕਦਮ \'ਤੇ' },
    ],
    notesLabel: 'ਲੱਛਣ ਅਤੇ ਨੋਟਸ',
    notesPlaceholder: 'ਜਿਵੇਂ ਸਵੇਰੇ ਅਕੜਾਅ ਸੀ, ਥੋੜ੍ਹੀ ਸੈਰ ਤੋਂ ਬਾਅਦ ਠੀਕ ਹੋ ਗਿਆ…',
    saveEntry: 'ਐਂਟਰੀ ਸੰਭਾਲੋ',
    saved: 'ਸੰਭਾਲਿਆ ਗਿਆ',
    continueToLayer2: 'ਪੱਧਰ 2 \'ਤੇ ਜਾਓ: ਲਾਈਵ YOLO ਗਤੀਸ਼ੀਲਤਾ',

    layer2Title: 'ਪੱਧਰ 2: ਇੰਟੈਲੀਜੈਂਟ YOLO ਵੀਡੀਓ ਗਾਈਡਡ ਕੈਪਚਰ',
    layer2Subtitle: '{joint} ਦੇ ਸਵੈਚਾਲਿਤ ਵੀਡੀਓ ਕੈਪਚਰ ਲਈ ਗਤੀਸ਼ੀਲ ਰੂਪਰੇਖਾ ਦੇ ਅੰਦਰ ਸਰੀਰ ਨੂੰ ਸੇਧ ਵਿੱਚ ਰੱਖੋ।',
    backToLayer1: '← ਪੱਧਰ 1 \'ਤੇ ਵਾਪਸ (ਸੰਵੇਦਨਾ)',
    saveLayer1And2: 'ਡਾਇਰੀ ਸੰਭਾਲੋ (ਪੱਧਰ 1 ਅਤੇ 2)',
    proceedToLayer3: 'ਪੱਧਰ 3 \'ਤੇ ਅੱਗੇ ਵਧੋ (ਰੇਡੀਓਲੋਜੀ)',

    layer3Title: 'ਪੱਧਰ 3: ਰੇਡੀਓਲੌਜੀਕਲ ਮੁਲਾਂਕਣ ਅਤੇ ਟੂਲਟਿਪਸ',
    layer3Subtitle: 'ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਡਾਕਟਰੀ ਸ਼ਬਦਾਂ ਦੇ ਨਾਲ ਐਕਸ-ਰੇ ਚਿੱਤਰ ਵਿਸ਼ਲੇਸ਼ਣ।',
    safeScopeVerdict: 'ਪੱਧਰ 2 ਨਤੀਜਾ: ਸੁਰੱਖਿਅਤ ਦਾਇਰਾ (ਰਵਾਇਤੀ ਦੇਖਭਾਲ)',
    radiologyAdvisedVerdict: 'ਪੱਧਰ 2 ਨਤੀਜਾ: ਰੇਡੀਓਗ੍ਰਾਫੀ ਦੀ ਸਲਾਹ (ਉੱਚ ਸਕੋਰ {score}/10)',
    hasXrayQuestion: 'ਕੀ ਤੁਹਾਡੇ ਕੋਲ {joint} ਲਈ ਹਾਲ ਹੀ ਦੇ ਐਕਸ-ਰੇ ਜਾਂ ਡਿਜੀਟਲ ਸਕੈਨ ਹਨ?',
    hasXrayYes: 'ਹਾਂ, ਮੇਰੇ ਕੋਲ ਐਕਸ-ਰੇ ਹੈ',
    hasXrayYesSub: 'ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ ਜਾਂ ਫੋਟੋ ਲਓ',
    hasXrayNo: 'ਅਜੇ ਐਕਸ-ਰੇ ਨਹੀਂ ਹੈ',
    hasXrayNoSub: 'ਡਾਕਟਰ ਲਈ ਪਰਚੀ ਤਿਆਰ ਕਰੋ',
    uploadLabel: 'ਐਕਸ-ਰੇ ਸਕੈਨ ਅੱਪਲੋਡ ਕਰੋ ਜਾਂ ਫਿਲਮ ਦੀ ਫੋਟੋ ਖਿੱਚੋ',
    browseOrPhotograph: 'ਚੁਣੋ ਜਾਂ ਫੋਟੋ ਲਓ',
    tooltipSectionHeader: 'ਇੰਟਰਐਕਟਿਵ ਰੇਡੀਓਗ੍ਰਾਫਿਕ ਮਾਰਕਰ ਅਤੇ ਸ਼ਬਦਾਵਲੀ ਟੂਲਟਿਪਸ:',
    tooltipTip: 'ਸੁਝਾਅ: ਤੁਰੰਤ ਸਰਲ ਅਨੁਵਾਦ ਲਈ ਉੱਪਰ ਕਿਸੇ ਵੀ ਰੇਖਾਂਕਿਤ ਸ਼ਬਦ \'ਤੇ ਕਲਿੱਕ ਕਰੋ ਜਾਂ ਕਰਸਰ ਲੈ ਜਾਓ।',
    requisitionTitle: 'ਕਲੀਨਿਕਲ ਰੇਡੀਓਗ੍ਰਾਫੀ ਮੰਗ ਪੱਤਰ ਮਾਰਗਦਰਸ਼ਨ',
    requisitionIntro: 'ਤੁਹਾਡੇ ਪੱਧਰ 1 ਸੰਵੇਦਨਾ ਸਕੋਰ ({pain}/10) ਅਤੇ ਪੱਧਰ 2 ਗਤੀਸ਼ੀਲਤਾ ਸਕੋਰ ({score}/10) ਦੇ ਆਧਾਰ \'ਤੇ, ਇਹ ਸਾਰਾਂਸ਼ ਆਪਣੇ ਡਾਕਟਰ ਨੂੰ ਦਿਖਾਓ:',
    requestedProtocolTitle: 'ਬੇਨਤੀ ਕੀਤਾ ਪ੍ਰੋਟੋਕੋਲ:',
    protocolBullet1: '• {joint} ਦਾ ਭਾਰ ਸਹਿੰਦੇ ਹੋਏ ਦੋਵੇਂ ਪਾਸੇ ਖੜ੍ਹੇ ਹੋ ਕੇ ਲਿਆ ਗਿਆ AP ਅਤੇ Lateral ਦ੍ਰਿਸ਼',
    protocolBullet2: '• ਕਾਰਟੀਲੇਜ ਦੀ ਸਥਿਤੀ ਜਾਣਨ ਲਈ Skyline / Sunrise ਵਿਊ',
    protocolBullet3: '• ਕਲੀਨਿਕਲ ਜਾਂਚ: ਓਸਟੀਓਫਾਈਟਸ ਅਤੇ ਜੋੜਾਂ ਦੀ ਥਾਂ ਘੱਟ ਹੋਣ (JSN) ਦੀ ਜਾਂਚ',
    combinedStatusTitle: '3-ਪੱਧਰੀ ਏਕੀਕ੍ਰਿਤ ਸਥਿਤੀ',
    layer1Pill: 'ਪੱਧਰ 1: {pain}/10 ਪ੍ਰਭਾਵ',
    layer2Pill: 'ਪੱਧਰ 2: {val}',
    layer3Pill: 'ਪੱਧਰ 3: {val}',
    backToLayer2: '← ਪੱਧਰ 2 \'ਤੇ ਵਾਪਸ',
    saveCompleteJournal: 'ਪੂਰੀ 3-ਪੱਧਰੀ ਡਾਇਰੀ ਸੰਭਾਲੋ',

    recentEntries: 'ਹਾਲੀਆ ਇੰਦਰਾਜ',
    triLayerLogs: '3-ਪੱਧਰੀ ਲੌਗਸ',
    relativeDates: {
      'Yesterday': 'ਕੱਲ੍ਹ',
      '2 days ago': '2 ਦਿਨ ਪਹਿਲਾਂ',
      '3 days ago': '3 ਦਿਨ ਪਹਿਲਾਂ',
      '5 days ago': '5 ਦਿਨ ਪਹਿਲਾਂ',
    },
    locationsMap: {
      'Right Knee': 'ਸੱਜਾ ਗੋਡਾ',
      'Left Knee': 'ਖੱਬਾ ਗੋਡਾ',
      'Right Hip': 'ਸੱਜਾ ਚੂਲਾ',
      'Left Hip': 'ਖੱਬਾ ਚੂਲਾ',
      'Lumbar Spine': 'ਲੰਬਰ ਰੀੜ੍ਹ',
      'Neck': 'ਗਰਦਨ',
    },
    seedNotes: {
      'j1': 'ਸਵੇਰੇ ਹਲਕਾ ਅਕੜਾਅ ਸੀ, ਥੋੜ੍ਹੀ ਸੈਰ ਤੋਂ ਬਾਅਦ ਠੀਕ ਹੋ ਗਿਆ।',
      'j2': 'ਪੌੜੀਆਂ ਚੜ੍ਹਨ ਵੇਲੇ ਕੁਝ ਤਕਲੀਫ ਸੀ ਪਰ ਸਹਿਣਯੋਗ।',
      'j3': 'ਮੁਸ਼ਕਲ ਦਿਨ ਸੀ, ਦਰਦ ਕਾਰਨ ਨੀਂਦ ਖੁੱਲ੍ਹ ਗਈ। ਆਮ ਨਾਲੋਂ ਵੱਧ ਆਰਾਮ ਕੀਤਾ।',
      'j4': 'ਹਫ਼ਤਿਆਂ ਵਿੱਚ ਸਭ ਤੋਂ ਮਾੜਾ ਦਿਨ। ਅਸਹਿ ਦਰਦ। ਸਹਾਰੇ ਤੋਂ ਬਿਨਾਂ ਨਹੀਂ ਤੁਰ ਸਕਦਾ।',
    },
  },
}

export function getTriLayerDict(lang: Language): TriLayerDictionary {
  return TRI_LAYER_DICTIONARIES[lang] || TRI_LAYER_DICTIONARIES.en
}

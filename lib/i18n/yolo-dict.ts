import type { Language } from './context'

export interface YoloDictionary {
  sitToStand: string
  walkingGait: string
  uploadFile: string
  alignSilhouette: string
  holdSteady: string
  stepBack: string
  shiftCenter: string
  dimLighting: string
  autoRecordCountdown: string
  recordingNow: string
  lightingGood: string
  roomTooDim: string
  highGlare: string
  aligned: string
  offCenter: string
  analyzingTitle: string
  analyzingSub: string
  readyTitle: string
  target: string
  evaluated: string
  mobilityScore: string
  estimatedKl: string
  conservativeSafeScope: string
  radiologicalAdvised: string
  retake: string
  acceptAndAttach: string
  startRecording: string
  stopRecording: string
  flipCamera: string
  uploadOrDrag: string
  dropFileHere: string
  supportedFormats: string
  analyzeRecording: string
}

export const YOLO_DICTIONARIES: Record<Language, YoloDictionary> = {
  en: {
    sitToStand: '30s Sit-to-Stand',
    walkingGait: 'Walking Gait',
    uploadFile: 'Upload File',
    alignSilhouette: 'Align your body inside the silhouette',
    holdSteady: 'Hold steady... Ready to record',
    stepBack: 'Step back 5 feet (Silhouette fit)',
    shiftCenter: 'Shift left/right to center',
    dimLighting: 'Lighting too dim - turn on light',
    autoRecordCountdown: 'Auto-recording in {countdown}s...',
    recordingNow: 'Recording mobility video...',
    lightingGood: 'Lighting Good',
    roomTooDim: 'Room Too Dim',
    highGlare: 'High Glare',
    aligned: 'Aligned',
    offCenter: 'Off Center',
    analyzingTitle: 'YOLO Pose & Mobility Analyzing…',
    analyzingSub: 'Processing joint kinematics, sit-to-stand cadence, and gait symmetry indices.',
    readyTitle: 'Layer 2 Mobility Analysis Ready',
    target: 'Target',
    evaluated: 'Evaluated',
    mobilityScore: 'Mobility Score',
    estimatedKl: 'Est. KL Rating',
    conservativeSafeScope: 'Conservative Safe Scope',
    radiologicalAdvised: 'Radiological Data Advised',
    retake: 'Retake Mobility Recording',
    acceptAndAttach: 'Accept & Attach to Journal',
    startRecording: 'Start Recording (5s)',
    stopRecording: 'Stop Recording',
    flipCamera: 'Flip Camera',
    uploadOrDrag: 'Upload Mobility Video or Joint Photo',
    dropFileHere: 'Drop file here...',
    supportedFormats: 'Accepts MP4, MOV, WebM or Photos up to 200 MB',
    analyzeRecording: 'Analyze Recording with YOLO',
  },
  as: {
    sitToStand: '৩০ছে. বহা-উঠা পৰীক্ষা',
    walkingGait: 'খোজ কঢ়াৰ গতি',
    uploadFile: 'ফাইল আপল’ড',
    alignSilhouette: 'গাঠনিৰ ভিতৰত আপোনাৰ শৰীৰ মিলাওক',
    holdSteady: 'স্থিৰ হৈ থাকক... ৰেকৰ্ডিং আৰম্ভ হ’ব',
    stepBack: '৫ ফুট পিছুৱাই যাওক (সম্পূৰ্ণ শৰীৰ চাওক)',
    shiftCenter: 'মাজভাগলৈ আহক',
    dimLighting: 'পোহৰ কম - লাইট জ্বলাওক',
    autoRecordCountdown: '{countdown} ছেকেণ্ডত স্বয়ংক্ৰিয় ৰেকৰ্ডিং...',
    recordingNow: 'গতিশীলতাৰ ভিডিঅ’ ৰেকৰ্ড হৈ আছে...',
    lightingGood: 'পোহৰ উপযুক্ত',
    roomTooDim: 'কোঠাৰ পোহৰ কম',
    highGlare: 'অত্যাধিক পোহৰ',
    aligned: 'সঠিক স্থানত',
    offCenter: 'মাজত নাই',
    analyzingTitle: 'YOLO প’জ আৰু গতিশীলতা বিশ্লেষণ চলিছে…',
    analyzingSub: 'গাঁঠিৰ চলন, বহা-উঠা ছন্দ আৰু খোজৰ সমতা নিৰ্ণয় কৰা হৈছে।',
    readyTitle: 'স্তৰ ২ গতিশীলতা বিশ্লেষণ প্ৰস্তুত',
    target: 'লক্ষ্য',
    evaluated: 'মূল্যায়িত',
    mobilityScore: 'গতিশীলতা নম্বৰ',
    estimatedKl: 'আনুমানিক KL গ্ৰেড',
    conservativeSafeScope: 'সংৰক্ষণশীল সুৰক্ষিত পৰিসৰ',
    radiologicalAdvised: 'ৰেডিঅ’লজি পৰামৰ্শ দিয়া হৈছে',
    retake: 'পুনৰ ৰেকৰ্ড কৰক',
    acceptAndAttach: 'গ্ৰহণ কৰক আৰু দিনলিপিত সংলগ্ন কৰক',
    startRecording: 'ৰেকৰ্ডিং আৰম্ভ (৫ ছে.)',
    stopRecording: 'ৰেকৰ্ডিং বন্ধ কৰক',
    flipCamera: 'কেমেৰা সলনি কৰক',
    uploadOrDrag: 'ভিডিঅ’ বা ফটো আপল’ড বা টানি আনক',
    dropFileHere: 'ফাইল ইয়াত এৰি দিয়ক...',
    supportedFormats: 'MP4, WebM, MOV, JPEG, PNG সমৰ্থন কৰে (সৰ্বোচ্চ ৫০MB)',
    analyzeRecording: 'YOLO-ৰ সৈতে ৰেকৰ্ডিং বিশ্লেষণ কৰক',
  },
  hi: {
    sitToStand: '30s उठना-बैठना टेस्ट',
    walkingGait: 'चाल / गेट',
    uploadFile: 'फ़ाइल अपलोड',
    alignSilhouette: 'छायाचित्र के भीतर अपना शरीर संरेखित करें',
    holdSteady: 'स्थिर रहें... रिकॉर्डिंग के लिए तैयार',
    stepBack: '5 फीट पीछे हटें (पूरा शरीर दिखें)',
    shiftCenter: 'केंद्र में आने के लिए बाएं/दाएं हटें',
    dimLighting: 'रोशनी कम है - लाइट चालू करें',
    autoRecordCountdown: '{countdown}s में ऑटो-रिकॉर्डिंग...',
    recordingNow: 'गतिशीलता वीडियो रिकॉर्ड हो रहा है...',
    lightingGood: 'रोशनी अच्छी है',
    roomTooDim: 'कमरा बहुत धीमा',
    highGlare: 'तेज़ चमक',
    aligned: 'संरेखित',
    offCenter: 'केंद्र से बाहर',
    analyzingTitle: 'YOLO पोज़ और गतिशीलता विश्लेषण जारी है…',
    analyzingSub: 'जोड़ों के संचलन, उठने-बैठने की लय और चाल की समरूपता का विश्लेषण किया जा रहा है।',
    readyTitle: 'स्तर 2 गतिशीलता विश्लेषण तैयार है',
    target: 'लक्ष्य',
    evaluated: 'मूल्यांकन पूरा',
    mobilityScore: 'गतिशीलता स्कोर',
    estimatedKl: 'अनुमानित KL ग्रेड',
    conservativeSafeScope: 'सुरक्षित दायरा (कंजर्वेटिव)',
    radiologicalAdvised: 'रेडियोलॉजी जांच की सलाह',
    retake: 'दोबारा रिकॉर्ड करें',
    acceptAndAttach: 'स्वीकारें और डायरी में जोड़ें',
    startRecording: 'रिकॉर्डिंग शुरू करें (5s)',
    stopRecording: 'रिकॉर्डिंग रोकें',
    flipCamera: 'कैमरा पलटें',
    uploadOrDrag: 'वीडियो या फ़ोटो अपलोड / ड्रैग करें',
    dropFileHere: 'फ़ाइल यहाँ छोड़ें...',
    supportedFormats: 'MP4, WebM, MOV, JPEG, PNG समर्थित (अधिकतम 50MB)',
    analyzeRecording: 'YOLO से रिकॉर्डिंग का विश्लेषण करें',
  },
  bn: {
    sitToStand: '৩০সে. বসা-ওঠা পরীক্ষা',
    walkingGait: 'হাঁটার গতি / গেইট',
    uploadFile: 'ফাইল আপলোড',
    alignSilhouette: 'সিলুয়েটের মধ্যে আপনার শরীর সারিবদ্ধ করুন',
    holdSteady: 'স্থির থাকুন... রেকর্ডিং এর জন্য প্রস্তুত',
    stepBack: '৫ ফুট পিছিয়ে যান (পুরো শরীর দেখান)',
    shiftCenter: 'মাঝখানে আসতে ডানে/বামে সরুন',
    dimLighting: 'আলো কম - আলো জ্বালান',
    autoRecordCountdown: '{countdown} সেকেন্ডে স্বয়ংক্রিয় রেকর্ডিং...',
    recordingNow: 'গতিশীলতার ভিডিও রেকর্ড হচ্ছে...',
    lightingGood: 'আলো ভালো',
    roomTooDim: 'ঘর খুব অন্ধকার',
    highGlare: 'অতিরিক্ত আলো',
    aligned: 'সারিবদ্ধ',
    offCenter: 'মাঝখানে নেই',
    analyzingTitle: 'YOLO পোজ ও গতিশীলতা বিশ্লেষণ চলছে…',
    analyzingSub: 'জয়েন্টের গতিবিধি, বসা-ওঠার ছন্দ এবং হাঁটার ভারসাম্য বিশ্লেষণ করা হচ্ছে।',
    readyTitle: 'স্তর ২ গতিশীলতা বিশ্লেষণ প্রস্তুত',
    target: 'টার্গেট',
    evaluated: 'মূল্যায়িত',
    mobilityScore: 'গতিশীলতা স্কোর',
    estimatedKl: 'আনুমানিক KL গ্রেড',
    conservativeSafeScope: 'সংরক্ষণশীল নিরাপদ পরিসীমা',
    radiologicalAdvised: 'রেডিওলজি পরামর্শ দেওয়া হয়েছে',
    retake: 'পুনরায় রেকর্ড করুন',
    acceptAndAttach: 'গ্রহণ করুন এবং ডায়েরিতে যুক্ত করুন',
    startRecording: 'রেকর্ডিং শুরু করুন (৫ সে.)',
    stopRecording: 'রেকর্ডিং বন্ধ করুন',
    flipCamera: 'ক্যামেরা উল্টান',
    uploadOrDrag: 'ভিডিও বা ছবি আপলোড বা টেনে আনুন',
    dropFileHere: 'ফাইল এখানে ফেলুন...',
    supportedFormats: 'MP4, WebM, MOV, JPEG, PNG সমর্থিত (সর্বোচ্চ ৫০MB)',
    analyzeRecording: 'YOLO দিয়ে রেকর্ডিং বিশ্লেষণ করুন',
  },
  pa: {
    sitToStand: '30s ਬੈਠਣਾ-ਉੱਠਣਾ ਟੈਸਟ',
    walkingGait: 'ਤੁਰਨ ਦੀ ਚਾਲ',
    uploadFile: 'ਫ਼ਾਈਲ ਅੱਪਲੋਡ',
    alignSilhouette: 'ਸਿਲੂਏਟ ਦੇ ਅੰਦਰ ਆਪਣਾ ਸਰੀਰ ਇਕਸਾਰ ਕਰੋ',
    holdSteady: 'ਸਥਿਰ ਰਹੋ... ਰਿਕਾਰਡਿੰਗ ਲਈ ਤਿਆਰ',
    stepBack: '5 ਫੁੱਟ ਪਿੱਛੇ ਹਟੋ (ਪੂਰਾ ਸਰੀਰ ਦਿਖਾਓ)',
    shiftCenter: 'ਕੇਂਦਰ ਵਿੱਚ ਆਉਣ ਲਈ ਖੱਬੇ/ਸੱਜੇ ਹੋਵੋ',
    dimLighting: 'ਰੋਸ਼ਨੀ ਘੱਟ ਹੈ - ਲਾਈਟ ਚਾਲੂ ਕਰੋ',
    autoRecordCountdown: '{countdown} ਸਕਿੰਟਾਂ ਵਿੱਚ ਆਟੋ-ਰਿਕਾਰਡਿੰਗ...',
    recordingNow: 'ਗਤੀਸ਼ੀਲਤਾ ਵੀਡੀਓ ਰਿਕਾਰਡ ਹੋ ਰਿਹਾ ਹੈ...',
    lightingGood: 'ਰੋਸ਼ਨੀ ਵਧੀਆ',
    roomTooDim: 'ਕਮਰੇ ਵਿੱਚ ਹਨੇਰਾ',
    highGlare: 'ਤੇਜ਼ ਚਮਕ',
    aligned: 'ਇਕਸਾਰ',
    offCenter: 'ਕੇਂਦਰ ਤੋਂ ਬਾਹਰ',
    analyzingTitle: 'YOLO ਪੋਜ਼ ਅਤੇ ਗਤੀਸ਼ੀਲਤਾ ਵਿਸ਼ਲੇਸ਼ਣ ਜਾਰੀ ਹੈ…',
    analyzingSub: 'ਜੋੜਾਂ ਦੀ ਗਤੀ, ਬੈਠਣ-ਉੱਠਣ ਦੀ ਤਾਲ ਅਤੇ ਚਾਲ ਦੀ ਸਮਰੂਪਤਾ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।',
    readyTitle: 'ਪੱਧਰ 2 ਗਤੀਸ਼ੀਲਤਾ ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਹੈ',
    target: 'ਨਿਸ਼ਾਨਾ',
    evaluated: 'ਮੁਲਾਂਕਣ ਮੁਕੰਮਲ',
    mobilityScore: 'ਗਤੀਸ਼ੀਲਤਾ ਸਕੋਰ',
    estimatedKl: 'ਅੰਦਾਜ਼ਨ KL ਗ੍ਰੇਡ',
    conservativeSafeScope: 'ਸੁਰੱਖਿਅਤ ਦਾਇਰਾ (ਕੰਜ਼ਰਵੇਟਿਵ)',
    radiologicalAdvised: 'ਰੇਡੀਓਲੋਜੀ ਦੀ ਸਲਾਹ',
    retake: 'ਦੁਬਾਰਾ ਰਿਕਾਰਡ ਕਰੋ',
    acceptAndAttach: 'ਸਵੀਕਾਰ ਕਰੋ ਅਤੇ ਡਾਇਰੀ ਵਿੱਚ ਜੋੜੋ',
    startRecording: 'ਰਿਕਾਰਡਿੰਗ ਸ਼ੁਰੂ ਕਰੋ (5s)',
    stopRecording: 'ਰਿਕਾਰਡਿੰਗ ਰੋਕੋ',
    flipCamera: 'ਕੈਮਰਾ ਬਦਲੋ',
    uploadOrDrag: 'ਵੀਡੀਓ ਜਾਂ ਫੋਟੋ ਅੱਪਲੋਡ / ਡਰੈਗ ਕਰੋ',
    dropFileHere: 'ਫ਼ਾਈਲ ਇੱਥੇ ਸੁੱਟੋ...',
    supportedFormats: 'MP4, WebM, MOV, JPEG, PNG ਸਮਰਥਿਤ (ਵੱਧ ਤੋਂ ਵੱਧ 50MB)',
    analyzeRecording: 'YOLO ਨਾਲ ਰਿਕਾਰਡਿੰਗ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
  },
}

export function getYoloDict(lang: Language): YoloDictionary {
  return YOLO_DICTIONARIES[lang] || YOLO_DICTIONARIES.en
}

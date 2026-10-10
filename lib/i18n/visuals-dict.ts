import type { Language } from './context'
import type { StudyTopicId } from '@/lib/data'

export interface VisualsDictionary {
  // Common visual modal
  interactiveVisuals: string
  viewDiagram: string
  closeDiagram: string

  // Captions
  captions: Record<StudyTopicId, string>

  // Topic 1: Osteoarthritis Degeneration Stages (know-oa)
  knowOa: {
    stage0Title: string
    stage0Desc: string
    stage1Title: string
    stage1Desc: string
    stage2Title: string
    stage2Desc: string
    stage34Title: string
    stage34Desc: string
  }

  // Topic 2: Mechanical vs Inflammatory (symptoms)
  symptoms: {
    mechanicalTitle: string
    mechanicalStiffness: string
    mechanicalActivity: string
    mechanicalSigns: string
    raBadge: string
    raTitle: string
    raStiffness: string
    raActivity: string
    raSigns: string
    morningStiffnessLabel: string
    activityPatternLabel: string
    physicalSignsLabel: string
  }

  // Topic 3: Diet & Load (diet)
  diet: {
    oliveTitle: string
    oliveDesc: string
    sulforaphaneTitle: string
    sulforaphaneDesc: string
    ratioTitle: string
    ratioDesc: string
  }

  // Topic 4: Exercise 3 Pillars & 24-Hour Pain Rule (exercise)
  exercise: {
    pillar1Title: string
    pillar1Desc: string
    pillar2Title: string
    pillar2Desc: string
    pillar3Title: string
    pillar3Desc: string
    painRuleTitle: string
    protocolBadge: string
    rule1Title: string
    rule1Desc: string
    rule2Title: string
    rule2Desc: string
    rule3Title: string
    rule3Desc: string
  }
}

export const VISUALS_DICTIONARIES: Record<Language, VisualsDictionary> = {
  // ── English ───────────────────────────────────────────────────────────────
  en: {
    interactiveVisuals: 'Interactive Clinical Visuals',
    viewDiagram: 'View Diagram',
    closeDiagram: 'Close Diagram',
    captions: {
      'know-oa': 'Figure 1: Comparison between healthy joint architecture and the degenerative stages of Osteoarthritis (Articular cartilage thinning, osteophyte development, and subchondral bone sclerosis).',
      symptoms: 'Figure 2: Clinical distinction between mechanical osteoarthritis pain (activity-dependent) and systemic inflammatory arthritis (prolonged morning stiffness > 45 minutes).',
      diet: 'Figure 3: Biomechanical load distribution and Mediterranean anti-inflammatory food matrix supporting chondrocyte metabolic health.',
      exercise: 'Figure 4: The 3 Pillars of Knee & Hip Osteoarthritis Rehabilitation and the 24-Hour Post-Exercise Pain Threshold Protocol.',
    },
    knowOa: {
      stage0Title: 'Stage 0: Healthy Joint',
      stage0Desc: 'Intact hyaline cartilage, resilient synovial fluid, and normal joint space width.',
      stage1Title: 'Stage 1: Early Softening',
      stage1Desc: 'Microscopic chondrocyte disruption, loss of proteoglycans, and mild surface fraying.',
      stage2Title: 'Stage 2: Mild OA',
      stage2Desc: 'Early osteophyte spurs, localized joint space narrowing, and cartilage fibrillations.',
      stage34Title: 'Stage 3-4: Severe OA',
      stage34Desc: 'Full-thickness cartilage loss, bone-on-bone friction, subchondral sclerosis, and marked deformity.',
    },
    symptoms: {
      mechanicalTitle: 'Mechanical OA Pain (Activity-Induced)',
      mechanicalStiffness: 'Short duration (< 30 minutes).',
      mechanicalActivity: 'Increases with prolonged loading, improves with rest.',
      mechanicalSigns: 'Crepitus (crunching sensations) & hard bony enlargements.',
      raBadge: 'RA',
      raTitle: 'Inflammatory Arthritis (e.g. RA)',
      raStiffness: 'Prolonged (> 45-60 minutes).',
      raActivity: 'Often worse after rest, eases temporarily with light movement.',
      raSigns: 'Soft, spongy synovial swelling, systemic warmth, and fatigue.',
      morningStiffnessLabel: 'Morning stiffness',
      activityPatternLabel: 'Activity pattern',
      physicalSignsLabel: 'Physical signs',
    },
    diet: {
      oliveTitle: 'Oleocanthal & Polyphenols',
      oliveDesc: 'Extra-virgin olive oil inhibits COX-1 & COX-2 inflammatory enzymes naturally.',
      sulforaphaneTitle: 'Sulforaphane Protection',
      sulforaphaneDesc: 'Cruciferous vegetables block matrix metalloproteinases (MMPs) that degrade cartilage.',
      ratioTitle: '1 : 4 Biomechanical Ratio',
      ratioDesc: 'Losing 1 kg of body weight removes ~4 kg of cumulative compressive load per knee step.',
    },
    exercise: {
      pillar1Title: 'Pillar 1: Strength',
      pillar1Desc: 'Isometric quadriceps contractions & gluteal stabilization.',
      pillar2Title: 'Pillar 2: Aerobic',
      pillar2Desc: 'Low-impact walking, stationary cycling, & aquatic swimming.',
      pillar3Title: 'Pillar 3: Mobility',
      pillar3Desc: 'Gentle range-of-motion stretches & hamstring elongation.',
      painRuleTitle: '24-Hour Pain Rule: Safe Progression Guide',
      protocolBadge: 'Clinical Protocol',
      rule1Title: 'Pain < 3/10 during exercise',
      rule1Desc: 'Safe range. Continue current routine.',
      rule2Title: 'Pain clears in 2 hours',
      rule2Desc: 'Acceptable adaptation response.',
      rule3Title: 'Pain persists > 24 hours',
      rule3Desc: 'Overload. Reduce intensity by 20% next session.',
    },
  },

  // ── Assamese (অসমীয়া) ───────────────────────────────────────────────────
  as: {
    interactiveVisuals: 'ক্লিনিকেল চিত্ৰ আৰু দৃশ্যমান নিৰ্দেশিকা',
    viewDiagram: 'চিত্ৰ চাওক',
    closeDiagram: 'বন্ধ কৰক',
    captions: {
      'know-oa': 'চিত্ৰ ১: সুস্থ গাঁঠি আৰু অষ্টিঅ\'আৰ্থ্ৰাইটিছৰ বিভিন্ন পৰ্যায়ৰ তুলনা (কাৰ্টিলেজ ক্ষয়, অষ্টিঅ\'ফাইট গঠন আৰু হাড়ৰ স্ক্লেৰ\'চিছ)।',
      symptoms: 'চিত্ৰ ২: যান্ত্ৰিক অষ্টিঅ\'আৰ্থ্ৰাইটিছ বিষ (সক্ৰিয়তাৰ সৈতে) আৰু প্ৰদাহজনিত আৰ্থ্ৰাইটিছৰ ক্লিনিকেল পাৰ্থক্য।',
      diet: 'চিত্ৰ ৩: বায়\'মেকানাইজড ভৰ বিতৰণ আৰু কাৰ্টিলেজ সুৰক্ষাৰ বাবে প্ৰদাহ-প্ৰতিৰোধী খাদ্য তালিকা।',
      exercise: 'চিত্ৰ ৪: আঁঠু আৰু নিতম্বৰ অষ্টিঅ\'আৰ্থ্ৰাইটিছ পুনৰ্বাসনৰ ৩ টা মূল স্তম্ভ আৰু ২৪ ঘণ্টীয়া বিষ নিৰ্ণয় প্ৰট\'কল।',
    },
    knowOa: {
      stage0Title: 'পৰ্যায় ০: সুস্থ গাঁঠি',
      stage0Desc: 'মসৃণ হায়ালিন কাৰ্টিলেজ, সুস্থ চাইনোভিয়েল তৰল আৰু স্বাভাৱিক গাঁঠিৰ ব্যৱধান।',
      stage1Title: 'পৰ্যায় ১: প্ৰাৰম্ভিক কোমলতা',
      stage1Desc: 'কাৰ্টিলেজ কোষৰ সামান্য ক্ষতি, প্ৰ\'টিঅ\'গ্লাইকান হ্ৰাস আৰু উপৰিভাগ খহটা হোৱা।',
      stage2Title: 'পৰ্যায় ২: মৃদু অষ্টিঅ\'আৰ্থ্ৰাইটিছ',
      stage2Desc: 'প্ৰাৰম্ভিক অষ্টিঅ\'ফাইট (হাড়ৰ অতিৰিক্ত অংশ), স্থানীয় গাঁঠিৰ স্থান হ্ৰাস আৰু কাৰ্টিলেজৰ খহটা ভাব।',
      stage34Title: 'পৰ্যায় ৩–৪: গুৰুতৰ অষ্টিঅ\'আৰ্থ্ৰাইটিছ',
      stage34Desc: 'কাৰ্টিলেজ সম্পূৰ্ণ ক্ষয়, হাড়ৰ সৈতে হাড়ৰ ঘঁহনি, ছাবকণ্ড্ৰেল স্ক্লেৰ\'চিছ আৰু গাঁঠি বিকৃতি।',
    },
    symptoms: {
      mechanicalTitle: 'যান্ত্ৰিক OA বিষ (সক্ৰিয়তা-আধাৰিত)',
      mechanicalStiffness: 'কম সময়ৰ (< ৩০ মিনিট)।',
      mechanicalActivity: 'দীঘলীয়া কাম কৰিলে বাঢ়ে, বিশ্ৰামত উপশম হয়।',
      mechanicalSigns: 'গাঁঠিৰ মচমচনি (Crepitus) আৰু হাড় ডাঠ হোৱা।',
      raBadge: 'RA',
      raTitle: 'প্ৰদাহজনিত আৰ্থ্ৰাইটিছ (যেনে RA)',
      raStiffness: 'দীঘলীয়া সময়ৰ (> ৪৫-৬০ মিনিট)।',
      raActivity: 'বিশ্ৰামৰ পিছত বেছি হয়, সামান্য লৰচৰত সাময়িকভাৱে কমে।',
      raSigns: 'কোমলকৈ ফুলা, গাঁঠি গৰম অনুভৱ হোৱা আৰু ভাগৰ লগা।',
      morningStiffnessLabel: 'ৰাতিপুৱাৰ কঠিনতা',
      activityPatternLabel: 'সক্ৰিয়তাৰ আৰ্হি',
      physicalSignsLabel: 'শাৰীৰিক লক্ষণ',
    },
    diet: {
      oliveTitle: 'অলিঅ\'কেন্থাল আৰু পলিফেনল',
      oliveDesc: 'এক্সট্ৰা-ভাৰ্জিন অলিভ অইলে প্ৰাকৃতিকভাৱে COX-1 আৰু COX-2 প্ৰদাহ সৃষ্টিকাৰী এনজাইম বাধা দিয়ে।',
      sulforaphaneTitle: 'ছালফ\'ৰাফেন সুৰক্ষা',
      sulforaphaneDesc: 'বন্ধাকবি আৰু ব্ৰকলিয়ে কাৰ্টিলেজ ধ্বংস কৰা এনজাইম (MMP) নিষ্ক্ৰিয় কৰে।',
      ratioTitle: '১ : ৪ বায়\'মেকানাইজড অনুপাত',
      ratioDesc: '১ কেজি ওজন হ্ৰাস কৰিলে প্ৰতি খোজত আঁঠুৰ পৰা প্ৰায় ৪ কেজি চাপ আঁতৰি যায়।',
    },
    exercise: {
      pillar1Title: 'স্তম্ভ ১: পেশীৰ শক্তি (STRENGTH)',
      pillar1Desc: 'কোৱাড্ৰিচেপ্স সংকোচন আৰু নিতম্বৰ পেশী শক্তিশালী কৰা ব্যায়াম।',
      pillar2Title: 'স্তম্ভ ২: এৰোবিক সহনশীলতা (AEROBIC)',
      pillar2Desc: 'গাঁথিত কম চাপ পেলোৱা খোজ কঢ়া, স্থিৰ চাইকেল চলোৱা আৰু সাঁতোৰ।',
      pillar3Title: 'স্তম্ভ ৩: গতিশীলতা আৰু নমনীয়তা (MOBILITY)',
      pillar3Desc: 'গাঁঠিৰ স্বাভাৱিক সঞ্চালন আৰু মাংসপেশী প্ৰসাৰণ (ষ্ট্ৰেচিং)।',
      painRuleTitle: '২৪-ঘণ্টীয়া বিষৰ নিয়ম: সুৰক্ষিত প্ৰগতি নিৰ্দেশিকা',
      protocolBadge: 'ক্লিনিকেল প্ৰট\'কল',
      rule1Title: 'ব্যায়ামৰ সময়ত বিষ < ৩/১০',
      rule1Desc: 'সুৰক্ষিত পৰিসৰ। বৰ্তমানৰ নিয়ম অব্যাহত ৰাখক।',
      rule2Title: '২ ঘণ্টাত বিষ উপশম হয়',
      rule2Desc: 'শৰীৰৰ স্বাভাৱিক অভিযোজন সঁহাৰি।',
      rule3Title: 'বিষ > ২৪ ঘণ্টা স্থায়ী হয়',
      rule3Desc: 'অত্যাধিক চাপ। পৰৱৰ্তী অধিবেশনত ২০% ব্যায়ামৰ মাত্ৰা হ্ৰাস কৰক।',
    },
  },

  // ── Hindi (हिंदी) ────────────────────────────────────────────────────────
  hi: {
    interactiveVisuals: 'इंटरैक्टिव क्लिनिकल चित्र और गाइड',
    viewDiagram: 'चित्र देखें',
    closeDiagram: 'बंद करें',
    captions: {
      'know-oa': 'चित्र 1: स्वस्थ जोड़ और ऑस्टियोआर्थराइटिस के विभिन्न चरणों की तुलना (कार्टिलेज घिसाव, ऑस्टियोफाइट्स और हड्डियों का कड़ापन)।',
      symptoms: 'चित्र 2: मैकेनिकल ऑस्टियोआर्थराइटिस दर्द (गतिविधि से जुड़ा) और सूजन वाले गठिया का क्लिनिकल अंतर।',
      diet: 'चित्र 3: बायोमैकेनिकल भार वितरण और कार्टिलेज कोशिकाओं की सुरक्षा के लिए सूजन-रोधी आहार।',
      exercise: 'चित्र 4: घुटने और कूल्हे के ऑस्टियोआर्थराइटिस पुनर्वास के 3 मुख्य स्तंभ और 24-घंटे दर्द नियम प्रोटोकॉल।',
    },
    knowOa: {
      stage0Title: 'स्टेज 0: स्वस्थ जोड़',
      stage0Desc: 'चिकना हाइलिन कार्टिलेज, स्वस्थ साइनोवियल द्रव और जोड़ों के बीच सामान्य स्थान।',
      stage1Title: 'स्टेज 1: शुरुआती नरमी',
      stage1Desc: 'कार्टिलेज कोशिकाओं की सूक्ष्म क्षति और सतह का खुरदरा होना शुरू होना।',
      stage2Title: 'स्टेज 2: हल्का ऑस्टियोआर्थराइटिस',
      stage2Desc: 'शुरुआती ऑस्टियोफाइट्स (हड्डी के उभार), जोड़ों का स्थान कम होना और कार्टिलेज में दरारें।',
      stage34Title: 'स्टेज 3–4: गंभीर ऑस्टियोआर्थराइटिस',
      stage34Desc: 'कार्टिलेज का पूरी तरह घिस जाना, हड्डी से हड्डी का घर्षण और जोड़ों का मुड़ना।',
    },
    symptoms: {
      mechanicalTitle: 'मैकेनिकल OA दर्द (गतिविधि-प्रेरित)',
      mechanicalStiffness: 'कम अवधि की (< 30 मिनट)।',
      mechanicalActivity: 'लंबे समय तक चलने/काम करने से बढ़ता है, आराम से सुधरता है।',
      mechanicalSigns: 'जोड़ों की चरचराहट (Crepitus) और हड्डियों का उभार।',
      raBadge: 'RA',
      raTitle: 'सूजन वाला गठिया (जैसे RA)',
      raStiffness: 'लंबी अवधि की (> 45-60 मिनट)।',
      raActivity: 'आराम के बाद अक्सर बढ़ता है, हल्की हलचल से अस्थायी रूप से कम होता है।',
      raSigns: 'मुलायम सूजन, जोड़ों में गर्माहट और थकान।',
      morningStiffnessLabel: 'सुबह की अकड़न',
      activityPatternLabel: 'गतिविधि पैटर्न',
      physicalSignsLabel: 'शारीरिक लक्षण',
    },
    diet: {
      oliveTitle: 'ओलियोकैंथल और पॉलीफेनोल्स',
      oliveDesc: 'एक्स्ट्रा-वर्जिन जैतून का तेल प्राकृतिक रूप से COX-1 और COX-2 सूजन एंजाइम को रोकता है।',
      sulforaphaneTitle: 'सल्फोराफेन संरक्षण',
      sulforaphaneDesc: 'पत्तागोभी और ब्रोकोली कार्टिलेज को नष्ट करने वाले एंजाइम (MMP) को रोकते हैं।',
      ratioTitle: '1 : 4 बायोमैकेनिकल अनुपात',
      ratioDesc: '1 किलो वजन कम करने से हर कदम पर घुटने से लगभग 4 किलो का दबाव हटता है।',
    },
    exercise: {
      pillar1Title: 'स्तंभ 1: ताकत (STRENGTH)',
      pillar1Desc: 'क्वाड्रिसेप्स संकुचन और कूल्हे की मांसपेशियों को मजबूत करने वाले व्यायाम।',
      pillar2Title: 'स्तंभ 2: एरोबिक (AEROBIC)',
      pillar2Desc: 'जोड़ों पर कम प्रभाव वाली सैर, स्थिर साइकिल चलाना और तैराकी।',
      pillar3Title: 'स्तंभ 3: गतिशीलता (MOBILITY)',
      pillar3Desc: 'जोड़ों की आसान हलचल और मांसपेशियों का खिंचाव (स्ट्रेचिंग)।',
      painRuleTitle: '24-घंटे का दर्द नियम: सुरक्षित प्रगति गाइड',
      protocolBadge: 'क्लिनिकल प्रोटोकॉल',
      rule1Title: 'व्यायाम के दौरान दर्द < 3/10',
      rule1Desc: 'सुरक्षित सीमा। वर्तमान दिनचर्या जारी रखें।',
      rule2Title: 'दर्द 2 घंटे में ठीक हो जाता है',
      rule2Desc: 'शरीर की सामान्य अनुकूलन प्रतिक्रिया।',
      rule3Title: 'दर्द > 24 घंटे बना रहता है',
      rule3Desc: 'अत्यधिक भार। अगले सत्र में तीव्रता 20% कम करें।',
    },
  },

  // ── Bengali (বাংলা) ───────────────────────────────────────────────────────
  bn: {
    interactiveVisuals: 'ইন্টারেক্টিভ ক্লিনিক্যাল চিত্র ও নির্দেশিকা',
    viewDiagram: 'চিত্র দেখুন',
    closeDiagram: 'বন্ধ করুন',
    captions: {
      'know-oa': 'চিত্র ১: সুস্থ জয়েন্ট এবং অস্টিওআর্থারাইটিসের বিভিন্ন পর্যায়ের তুলনা (কার্টিলেজের ক্ষয়, অস্টিওফাইট গঠন ও হাড়ের স্ক্লেরোসিস)।',
      symptoms: 'চিত্র ২: মেকানিক্যাল অস্টিওআর্থারাইটিস ব্যথা (কাজের সাথে যুক্ত) এবং প্রদাহজনিত আর্থারাইটিসের ক্লিনিক্যাল পার্থক্য।',
      diet: 'চিত্র ৩: বায়োমেকানিকাল ভার বণ্টন এবং কার্টিলেজ সুরক্ষার জন্য প্রদাহ-প্রতিরোধী খাদ্য তালিকা।',
      exercise: 'চিত্র ৪: হাঁটু ও নিতম্বের অস্টিওআর্থারাইটিস পুনর্বাসনের ৩টি স্তম্ভ এবং ২৪-ঘণ্টার ব্যথা নির্ণয় প্রোটোকল।',
    },
    knowOa: {
      stage0Title: 'স্টেজ ০: সুস্থ জয়েন্ট',
      stage0Desc: 'মসৃণ হায়ালিন কার্টিলেজ, স্বাভাবিক সাইনোভিয়াল তরল এবং পর্যাপ্ত জয়েন্ট স্পেস।',
      stage1Title: 'স্টেজ ১: প্রাথমিক নরম ভাব',
      stage1Desc: 'কার্টিলেজ কোষের মৃদু ক্ষতি এবং পৃষ্ঠতলের ক্ষয় শুরু হওয়া।',
      stage2Title: 'স্টেজ ২: মৃদু অস্টিওআর্থারাইটিস',
      stage2Desc: 'প্রাথমিক অস্টিওফাইট (অতিরিক্ত হাড় বৃদ্ধি), জয়েন্ট স্পেস কমে যাওয়া ও কার্টিলেজ ফাটল।',
      stage34Title: 'স্টেজ ৩–৪: গুরুতর অস্টিওআর্থারাইটিস',
      stage34Desc: 'কার্টিলেজ সম্পূর্ণ ক্ষয়, হাড়ে হাড়ে ঘর্ষণ, সাবকন্ড্রাল স্ক্লেরোসিস এবং বিকৃতি।',
    },
    symptoms: {
      mechanicalTitle: 'মেকানিক্যাল OA ব্যথা (কাজের সাথে যুক্ত)',
      mechanicalStiffness: 'স্বল্পস্থায়ী (< ৩০ মিনিট)।',
      mechanicalActivity: 'দীর্ঘক্ষণ কাজ করলে বাড়ে, বিশ্রামে কমে।',
      mechanicalSigns: 'জয়েন্টের ক্যাচক্যাচ শব্দ (Crepitus) এবং শক্ত হাড়ের বৃদ্ধি।',
      raBadge: 'RA',
      raTitle: 'প্রদাহজনিত আর্থারাইটিস (যেমন RA)',
      raStiffness: 'দীর্ঘস্থায়ী (> ৪৫-৬০ মিনিট)।',
      raActivity: 'বিশ্রামের পর বাড়ে, হালকা নড়াচড়ায় সাময়িক উপশম।',
      raSigns: 'নরম ফোলা ভাব, জয়েন্টে উত্তাপ এবং সামগ্রিক ক্লান্তি।',
      morningStiffnessLabel: 'সকালের আড়ষ্টতা',
      activityPatternLabel: 'কাজের প্যাটার্ন',
      physicalSignsLabel: 'শারীরিক লক্ষণ',
    },
    diet: {
      oliveTitle: 'ওলিওক্যান্থাল ও পলিফেনল',
      oliveDesc: 'এক্সট্রা-ভার্জিন অলিভ অয়েল প্রাকৃতিকভাবে প্রদাহ সৃষ্টিকারী এনজাইম দমন করে।',
      sulforaphaneTitle: 'সালফোরাফেন সুরক্ষা',
      sulforaphaneDesc: 'বাঁধাকপি ও ব্রকলি কার্টিলেজ ধ্বংসকারী এনজাইম প্রতিহত করে।',
      ratioTitle: '১ : ৪ বায়োমেকানিকাল অনুপাত',
      ratioDesc: '১ কেজি ওজন কমলে প্রতি পদক্ষেপে হাঁটু থেকে প্রায় ৪ কেজি চাপ হ্রাস পায়।',
    },
    exercise: {
      pillar1Title: 'স্তম্ভ ১: শক্তি বৃদ্ধি (STRENGTH)',
      pillar1Desc: 'কোয়াড্রিসেপস পেশি সংকোচন ও নিতম্বের পেশি দৃঢ় করার ব্যায়াম।',
      pillar2Title: 'স্তম্ভ ২: অ্যারোবিক (AEROBIC)',
      pillar2Desc: 'জয়েন্টে কম চাপযুক্ত হাঁটা, স্থির সাইকেল চালানো এবং সাঁতার।',
      pillar3Title: 'স্তম্ভ ৩: গতিশীলতা (MOBILITY)',
      pillar3Desc: 'জয়েন্টের স্বাভাবিক সঞ্চালন এবং পেশির প্রসারণ (স্ট্রেচিং)।',
      painRuleTitle: '২৪-ঘণ্টার ব্যথার নিয়ম: নিরাপদ অগ্রগতি গাইড',
      protocolBadge: 'ক্লিনিক্যাল প্রোটোকল',
      rule1Title: 'ব্যায়ামের সময় ব্যথা < ৩/১০',
      rule1Desc: 'নিরাপদ পরিসীমা। বর্তমান রুটিন চালিয়ে যান।',
      rule2Title: '২ ঘণ্টার মধ্যে ব্যথা কমে যায়',
      rule2Desc: 'শরীরের স্বাভাবিক অভিযোজন প্রতিক্রিয়া।',
      rule3Title: 'ব্যথা > ২৪ ঘণ্টা স্থায়ী হয়',
      rule3Desc: 'অতিরিক্ত চাপ। পরবর্তী সেশনে তীব্রতা ২০% হ্রাস করুন।',
    },
  },

  // ── Punjabi (ਪੰਜਾਬੀ) ─────────────────────────────────────────────────────
  pa: {
    interactiveVisuals: 'ਇੰਟਰਐਕਟਿਵ ਕਲੀਨਿਕਲ ਚਿੱਤਰ ਅਤੇ ਗਾਈਡ',
    viewDiagram: 'ਚਿੱਤਰ ਵੇਖੋ',
    closeDiagram: 'ਬੰਦ ਕਰੋ',
    captions: {
      'know-oa': 'ਚਿੱਤਰ 1: ਤੰਦਰੁਸਤ ਜੋੜ ਅਤੇ ਓਸਟੀਓਆਰਥਰਾਈਟਿਸ ਦੇ ਵੱਖ-ਵੱਖ ਪੜਾਵਾਂ ਦੀ ਤੁਲਨਾ (ਕਾਰਟੀਲੇਜ ਦਾ ਘਿਸਾਅ, ਓਸਟੀਓਫਾਈਟਸ ਅਤੇ ਹੱਡੀਆਂ ਦਾ ਕੜਾਪਣ)।',
      symptoms: 'ਚਿੱਤਰ 2: ਮਕੈਨੀਕਲ ਓਸਟੀਓਆਰਥਰਾਈਟਿਸ ਦਰਦ (ਗਤੀਵਿਧੀ ਨਾਲ ਜੁੜਿਆ) ਅਤੇ ਸੋਜ ਵਾਲੇ ਗਠੀਏ ਦਾ ਕਲੀਨਿਕਲ ਅੰਤਰ।',
      diet: 'ਚਿੱਤਰ 3: ਬਾਇਓਮਕੈਨੀਕਲ ਭਾਰ ਵੰਡ ਅਤੇ ਕਾਰਟੀਲੇਜ ਸੈੱਲਾਂ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਸੋਜ-ਵਿਰੋਧੀ ਖੁਰਾਕ।',
      exercise: 'ਚਿੱਤਰ 4: ਗੋਡੇ ਅਤੇ ਚੂਲੇ ਦੇ ਓਸਟੀਓਆਰਥਰਾਈਟਿਸ ਮੁੜ-ਵਸੇਬੇ ਦੇ 3 ਮੁੱਖ ਥੰਮ੍ਹ ਅਤੇ 24-ਘੰਟੇ ਦਰਦ ਨਿਯਮ ਪ੍ਰੋਟੋਕੋਲ।',
    },
    knowOa: {
      stage0Title: 'ਪੜਾਅ 0: ਤੰਦਰੁਸਤ ਜੋੜ',
      stage0Desc: 'ਚਿਕਨਾ ਹਾਈਲਿਨ ਕਾਰਟੀਲੇਜ, ਸਿਹਤਮੰਦ ਸਾਈਨੋਵੀਅਲ ਤਰਲ ਅਤੇ ਜੋੜਾਂ ਵਿਚਕਾਰ ਆਮ ਥਾਂ।',
      stage1Title: 'ਪੜਾਅ 1: ਸ਼ੁਰੂਆਤੀ ਨਰਮੀ',
      stage1Desc: 'ਕਾਰਟੀਲੇਜ ਸੈੱਲਾਂ ਦਾ ਸੂਖਮ ਨੁਕਸਾਨ ਅਤੇ ਸਤ੍ਹਾ ਦਾ ਖੁਰਦਰਾ ਹੋਣਾ ਸ਼ੁਰੂ ਹੋਣਾ।',
      stage2Title: 'ਪੜਾਅ 2: ਹਲਕਾ ਓਸਟੀਓਆਰਥਰਾਈਟਿਸ',
      stage2Desc: 'ਸ਼ੁਰੂਆਤੀ ਓਸਟੀਓਫਾਈਟਸ (ਹੱਡੀ ਦੇ ਉਭਾਰ), ਜੋੜਾਂ ਦੀ ਥਾਂ ਘਟਣੀ ਅਤੇ ਕਾਰਟੀਲੇਜ ਵਿੱਚ ਦਰਾਰਾਂ।',
      stage34Title: 'ਪੜਾਅ 3–4: ਗੰਭੀਰ ਓਸਟੀਓਆਰਥਰਾਈਟਿਸ',
      stage34Desc: 'ਕਾਰਟੀਲੇਜ ਦਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਘਿਸ ਜਾਣਾ, ਹੱਡੀ ਨਾਲ ਹੱਡੀ ਦਾ ਰਗੜਨਾ ਅਤੇ ਜੋੜਾਂ ਦਾ ਮੁੜਨਾ।',
    },
    symptoms: {
      mechanicalTitle: 'ਮਕੈਨੀਕਲ OA ਦਰਦ (ਗਤੀਵਿਧੀ-ਪ੍ਰੇਰਿਤ)',
      mechanicalStiffness: 'ਘੱਟ ਸਮੇਂ ਦੀ (< 30 ਮਿੰਟ)।',
      mechanicalActivity: 'ਲੰਬਾ ਸਮਾਂ ਤੁਰਨ/ਕੰਮ ਕਰਨ ਨਾਲ ਵਧਦਾ ਹੈ, ਆਰਾਮ ਨਾਲ ਸੁਧਰਦਾ ਹੈ।',
      mechanicalSigns: 'ਜੋੜਾਂ ਦੀ ਖੜਕਾਹਟ (Crepitus) ਅਤੇ ਹੱਡੀਆਂ ਦਾ ਉਭਾਰ।',
      raBadge: 'RA',
      raTitle: 'ਸੋਜ ਵਾਲਾ ਗਠੀਆ (ਜਿਵੇਂ RA)',
      raStiffness: 'ਲੰਬੇ ਸਮੇਂ ਦੀ (> 45-60 ਮਿੰਟ)।',
      raActivity: 'ਆਰਾਮ ਤੋਂ ਬਾਅਦ ਅਕਸਰ ਵਧਦਾ ਹੈ, ਹਲਕੀ ਹਿਲਜੁਲ ਨਾਲ ਆਰਜ਼ੀ ਤੌਰ \'ਤੇ ਘਟਦਾ ਹੈ।',
      raSigns: 'ਨਰਮ ਸੋਜ, ਜੋੜਾਂ ਵਿੱਚ ਨਿੱਘ ਅਤੇ ਥਕਾਵਟ।',
      morningStiffnessLabel: 'ਸਵੇਰ ਦੀ ਅਕੜਾਅ',
      activityPatternLabel: 'ਗਤੀਵਿਧੀ ਪੈਟਰਨ',
      physicalSignsLabel: 'ਸਰੀਰਕ ਲੱਛਣ',
    },
    diet: {
      oliveTitle: 'ਓਲੀਓਕੈਂਥਲ ਅਤੇ ਪੌਲੀਫੇਨੋਲ',
      oliveDesc: 'ਐਕਸਟ੍ਰਾ-ਵਰਜਿਨ ਜੈਤੂਨ ਦਾ ਤੇਲ ਕੁਦਰਤੀ ਤੌਰ \'ਤੇ ਸੋਜ ਪੈਦਾ ਕਰਨ ਵਾਲੇ ਐਂਜ਼ਾਈਮਾਂ ਨੂੰ ਰੋਕਦਾ ਹੈ।',
      sulforaphaneTitle: 'ਸਲਫੋਰਾਫੇਨ ਸੁਰੱਖਿਆ',
      sulforaphaneDesc: 'ਬੰਦਗੋਭੀ ਅਤੇ ਬ੍ਰੋਕਲੀ ਕਾਰਟੀਲੇਜ ਨੂੰ ਨਸ਼ਟ ਕਰਨ ਵਾਲੇ ਐਂਜ਼ਾਈਮਾਂ ਨੂੰ ਰੋਕਦੇ ਹਨ।',
      ratioTitle: '1 : 4 ਬਾਇਓਮਕੈਨੀਕਲ ਅਨੁਪਾਤ',
      ratioDesc: '1 ਕਿਲੋ ਭਾਰ ਘਟਾਉਣ ਨਾਲ ਹਰ ਕਦਮ \'ਤੇ ਗੋਡੇ ਤੋਂ ਲਗਭਗ 4 ਕਿਲੋ ਦਾ ਦਬਾਅ ਹਟਦਾ ਹੈ।',
    },
    exercise: {
      pillar1Title: 'ਥੰਮ੍ਹ 1: ਤਾਕਤ (STRENGTH)',
      pillar1Desc: 'ਕਵਾਡ੍ਰੀਸੈਪਸ ਸੰਕੁਚਨ ਅਤੇ ਚੂਲੇ ਦੀਆਂ ਮਾਸਪੇਸ਼ੀਆਂ ਨੂੰ ਮਜ਼ਬੂਤ ਕਰਨ ਵਾਲੀਆਂ ਕਸਰਤਾਂ।',
      pillar2Title: 'ਥੰਮ੍ਹ 2: ਐਰੋਬਿਕ (AEROBIC)',
      pillar2Desc: 'ਜੋੜਾਂ \'ਤੇ ਘੱਟ ਪ੍ਰਭਾਵ ਵਾਲੀ ਸੈਰ, ਸਥਿਰ ਸਾਈਕਲ ਚਲਾਉਣਾ ਅਤੇ ਤੈਰਾਕੀ।',
      pillar3Title: 'ਥੰਮ੍ਹ 3: ਗਤੀਸ਼ੀਲਤਾ (MOBILITY)',
      pillar3Desc: 'ਜੋੜਾਂ ਦੀ ਆਸਾਨ ਹਿਲਜੁਲ ਅਤੇ ਮਾਸਪੇਸ਼ੀਆਂ ਦਾ ਖਿੱਚਾਅ (ਸਟ੍ਰੈਚਿੰਗ)।',
      painRuleTitle: '24-ਘੰਟੇ ਦਾ ਦਰਦ ਨਿਯਮ: ਸੁਰੱਖਿਅਤ ਤਰੱਕੀ ਗਾਈਡ',
      protocolBadge: 'ਕਲੀਨਿਕਲ ਪ੍ਰੋਟੋਕੋਲ',
      rule1Title: 'ਕਸਰਤ ਦੌਰਾਨ ਦਰਦ < 3/10',
      rule1Desc: 'ਸੁਰੱਖਿਅਤ ਸੀਮਾ। ਮੌਜੂਦਾ ਰੁਟੀਨ ਜਾਰੀ ਰੱਖੋ।',
      rule2Title: 'ਦਰਦ 2 ਘੰਟਿਆਂ ਵਿੱਚ ਠੀਕ ਹੋ ਜਾਂਦਾ ਹੈ',
      rule2Desc: 'ਸਰੀਰ ਦਾ ਆਮ ਅਨੁਕੂਲਨ ਜਵਾਬ।',
      rule3Title: 'ਦਰਦ > 24 ਘੰਟੇ ਬਣਿਆ ਰਹਿੰਦਾ ਹੈ',
      rule3Desc: 'ਬਹੁਤ ਜ਼ਿਆਦਾ ਭਾਰ। ਅਗਲੇ ਸੈਸ਼ਨ ਵਿੱਚ ਤੀਬਰਤਾ 20% ਘਟਾਓ।',
    },
  },
}

export function getVisualsDict(lang: Language): VisualsDictionary {
  return VISUALS_DICTIONARIES[lang] || VISUALS_DICTIONARIES.en
}

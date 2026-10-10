export interface VideoItem {
  id: string
  title: string
  subtitle: string
  description: string
  src: string
  badge: string
  duration: string
  keyTakeaways: string[]
}

export interface MediaPhotoItem {
  id: string
  title: string
  caption: string
  src: string
  category: 'anatomy' | 'symptoms' | 'diet' | 'exercise' | 'osteoporosis'
  topicId?: string
  condition: 'oa' | 'osteoporosis'
}

export const CLINICAL_VIDEOS: VideoItem[] = [
  {
    id: 'oa-mechanics',
    title: 'Osteoarthritis Mechanics & Joint Cartilage Breakdown',
    subtitle: '3D Biomechanical & Histological Analysis',
    description:
      'Detailed 3D visualization illustrating articular cartilage wear, loss of proteoglycan matrix, joint space narrowing, and friction between femoral and tibial bone surfaces.',
    src: '/media/osteoarthritis/videos/Osteoarthritis_Mechanics.mp4',
    badge: 'Core Anatomy',
    duration: '3D Simulation',
    keyTakeaways: [
      'Hyaline cartilage has no nerve endings; pain originates from subchondral bone and synovium.',
      'Progressive joint space narrowing alters mechanical load distribution across the joint.',
      'Early conservative intervention preserves remaining cartilage and delays structural degeneration.',
    ],
  },
  {
    id: 'oa-exercise-relief',
    title: 'How Exercise Relieves Osteoarthritis Pain',
    subtitle: 'The Biology of "Motion is Lotion"',
    description:
      'Scientific explanation of the cyclic compression-decompression pump: how rhythmic, low-impact movement forces synovial fluid and vital nutrients directly into cartilage cells while reducing pain signaling.',
    src: '/media/osteoarthritis/videos/How_Exercise_Relieves_Osteoarthritis_Pain.mp4',
    badge: 'Rehabilitation Science',
    duration: 'Clinical Guide',
    keyTakeaways: [
      'Cartilage relies on movement-induced fluid pressure to absorb oxygen and nutrients.',
      'Strengthening periarticular muscles (quadriceps and hamstrings) absorbs joint impact forces.',
      'Physical activity triggers natural endorphin release and dampens central pain sensitization.',
    ],
  },
  {
    id: 'oa-practical-guide',
    title: 'Clinical Joint Care & Movement Demonstration',
    subtitle: 'Practical Daily Joint Mobility Guide',
    description:
      'Expert clinical demonstration showing safe joint-loading techniques, ergonomics, and daily mobility exercises designed to prevent joint stiffness and maintain full functional independence.',
    src: '/media/osteoarthritis/videos/WhatsApp%20Video%202026-09-11%20at%203.52.14%20PM.mp4',
    badge: 'Clinical Practice',
    duration: 'Practical Demo',
    keyTakeaways: [
      'Maintain continuous gentle motion throughout the day to prevent stiffness accumulation.',
      'Use proper chair height and body mechanics to unload vulnerable knee and hip joints.',
      'Consistency and safe range-of-motion take precedence over heavy exertion.',
    ],
  },
]

// Curated high-impact images matched directly to education modules
export const CURATED_TOPIC_MEDIA = {
  // ── Osteoarthritis ──────────────────────────────────────────
  'know-oa': [
    {
      id: 'knee-anatomy',
      title: 'Knee Joint Anatomy & Cartilage Architecture',
      caption:
        'Detailed anatomical breakdown of the knee joint: hyaline articular cartilage, medial/lateral menisci shock absorbers, and supporting cruciate ligaments.',
      src: '/media/osteoarthritis/photos/54bb29e85b8ca599001ac62e6d1bb14e.jpg',
      category: 'anatomy' as const,
      condition: 'oa' as const,
    },
    {
      id: 'cartilage-response',
      title: 'How Joint Cartilage Responds to Exercise & Loading',
      caption:
        'Biomechanics of cyclic loading: compression drives waste fluid out, while release draws nutrient-rich synovial fluid in to nourish chondrocytes.',
      src: '/media/osteoarthritis/photos/d4152c19ddfe72c9b97f2c93cf30d5bf.jpg',
      category: 'anatomy' as const,
      condition: 'oa' as const,
    },
    {
      id: 'cartilage-regeneration',
      title: 'Modern Cartilage Regeneration & Therapeutic Options',
      caption:
        'Overview of non-surgical biologic treatments (PRP, stem cell therapies) and restorative protocols preserving articular integrity.',
      src: '/media/osteoarthritis/photos/337205f43697632942a90e78d301301a.jpg',
      category: 'anatomy' as const,
      condition: 'oa' as const,
    },
  ],
  symptoms: [
    {
      id: 'oa-vs-ra',
      title: 'Osteoarthritis (OA) vs. Rheumatoid Arthritis (RA)',
      caption:
        'Critical clinical differentiation: Mechanical wear vs. autoimmune inflammation, duration of morning stiffness (< 30 min vs. > 60 min), and joint distribution.',
      src: '/media/osteoarthritis/photos/065b4c8f7d8922f7e6c1f771290279bc.jpg',
      category: 'symptoms' as const,
      condition: 'oa' as const,
    },
    {
      id: 'oa-stages',
      title: 'Clinical Stages of Cartilage Wear: Grade 1 to 4',
      caption:
        'From microscopic fibrillations to joint space narrowing and bone spurs (osteophytes). Early detection preserves function.',
      src: '/media/osteoarthritis/photos/5743642532117baac108e9c7dd409004.jpg',
      category: 'symptoms' as const,
      condition: 'oa' as const,
    },
    {
      id: 'joint-load-markers',
      title: 'Joint Pain Patterns & Biomechanical Warning Signs',
      caption:
        'Mapping localized stress in medial and patellofemoral compartments during stair descent and prolonged weight bearing.',
      src: '/media/osteoarthritis/photos/45b3de17d52d0fb5e3d6fdda112bbb1b.jpg',
      category: 'symptoms' as const,
      condition: 'oa' as const,
    },
  ],
  diet: [
    {
      id: 'anti-inflammatory-foods',
      title: '10 Foods That Naturally Reduce Joint Inflammation',
      caption:
        'Clinical food matrix featuring fatty fish (Omega-3s), blueberries, extra virgin olive oil, walnuts, turmeric, and cruciferous vegetables.',
      src: '/media/osteoarthritis/photos/3e6b18d109be3f206e965582f3fa800e.jpg',
      category: 'diet' as const,
      condition: 'oa' as const,
    },
    {
      id: 'antioxidant-foods',
      title: '12 Antioxidant-Rich Foods for Joint Protection',
      caption:
        'Cellular protection against free radical damage: anthocyanins, sulforaphane, catechins, and polyphenols supporting chondrocyte survival.',
      src: '/media/osteoarthritis/photos/3f25ce6f95daa51c890577a0c9251e12.jpg',
      category: 'diet' as const,
      condition: 'oa' as const,
    },
    {
      id: 'mediterranean-produce',
      title: 'Fresh Mediterranean Anti-Inflammatory Produce Matrix',
      caption:
        'Vibrant spectrum of phytonutrients, leafy greens, healthy fats, and antioxidants proven to lower systemic CRP biomarkers.',
      src: '/media/osteoarthritis/photos/80e6da1a218a7866b2e02f5897a5ebcd.jpg',
      category: 'diet' as const,
      condition: 'oa' as const,
    },
  ],
  exercise: [
    {
      id: 'resistance-seniors',
      title: 'Resistance Band Strength & Mobility for Seniors',
      caption:
        '16 gentle seated and standing exercises to rebuild stability, fortify leg stabilizers, and improve everyday functional mobility.',
      src: '/media/osteoarthritis/photos/40ed11189d2239fcd2bf5ccdc4f613ba.jpg',
      category: 'exercise' as const,
      condition: 'oa' as const,
    },
    {
      id: 'quad-flexibility',
      title: '5 Simple Exercises for Quadriceps Flexibility',
      caption:
        'Targeted quadriceps and hip flexor stretches to decompress the patellofemoral joint and reduce anterior knee pain.',
      src: '/media/osteoarthritis/photos/208316828cf4f950c0f42e16a6b5e3e1.jpg',
      category: 'exercise' as const,
      condition: 'oa' as const,
    },
    {
      id: 'knee-stability-routine',
      title: 'Functional Joint Stability & Daily Mobility Routine',
      caption:
        'Low-impact seated and standing movements designed to lubricate joints, engage stabilizer muscles, and prevent morning stiffness.',
      src: '/media/osteoarthritis/photos/e152d9b230bc5052d59933c3e1f8bb5b.jpg',
      category: 'exercise' as const,
      condition: 'oa' as const,
    },
  ],

  // ── Osteoporosis ──────────────────────────────────────────
  'know-osteoporosis': [
    {
      id: 'bone-anatomy',
      title: 'Bone Structure: Spongy vs. Compact Bone Matrix',
      caption:
        'Internal anatomy of human bone: periosteum, compact cortical bone, spongy trabecular bone, and nutrient blood vessels.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.26.52%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'types-of-bones',
      title: 'Types of Bones in the Human Skeleton',
      caption:
        'Classification: Long bones (femur), short bones, flat bones, irregular vertebrae, and sesamoid bones (patella).',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.28.06%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'spinal-column',
      title: 'The Human Spinal Column & Vertebral Curvature',
      caption:
        'Cervical, Thoracic, Lumbar, and Sacral regions: structural basis of posture and vulnerability to osteoporotic compression fractures.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.26.31%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
  ],
  'osteoporosis-symptoms': [
    {
      id: 'op-infographic',
      title: 'Osteoporosis Clinical Master Guide & Diagnostics',
      caption:
        'Bone remodeling imbalance (osteoclasts > osteoblasts), porous trabecular thinning, risk factors, and DXA scan T-score interpretation.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.28.56%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'dexa-scan',
      title: 'DEXA Bone Densitometer Clinical Scan',
      caption:
        'The clinical gold standard for measuring bone mineral density (BMD): painless, accurate, and essential for early osteopenia detection.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.24.49%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'dowagers-hump',
      title: "Dowager's Hump (Kyphosis from Vertebral Compression)",
      caption:
        'Postural changes resulting from silent micro-fractures in the thoracic spine, leading to height loss and forward curvature.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.27.27%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
  ],
  'osteoporosis-diet': [
    {
      id: 'calcium-meals',
      title: 'Calcium-Rich Meals & Everyday Food Plate',
      caption:
        'Complete nutritional plate: dairy yogurt, cheese, fortified tofu, steamed broccoli, dark leafy greens, almonds, and sesame seeds.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.27.18%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'vitamin-d-foods',
      title: 'Fuel Your Vitamin D Naturally & Deliciously',
      caption:
        'Essential Vitamin D sources to ensure optimal intestinal calcium absorption: fatty fish, egg yolks, UV mushrooms, and fortified milk.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.28.38%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
  ],
  'osteoporosis-exercise': [
    {
      id: 'fall-prevention',
      title: 'Exercises for Fall Prevention (12-Drill Protocol)',
      caption:
        'Evidence-based clinical movement sequence to sharpen neuromuscular coordination, leg power, and dynamic equilibrium.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.30.05%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'balance-guide',
      title: 'Senior Balance Guide: 5 Essential Standing Drills',
      caption:
        'Single-leg stand, tandem heel-to-toe stand, chair squats, calf raises, and side leg raises for rock-solid stability.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.29.51%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'hip-mobility',
      title: '6 Effective Hip Mobility Moves for Active Living',
      caption:
        'Targeted hip flexor stretches, 90/90 rotations, and glute strengtheners to relieve stress on weight-bearing joints.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.29.10%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
    {
      id: 'resistance-types',
      title: 'Resistance Training Modalities for Bone Density',
      caption:
        'How mechanical tensile forces stimulate osteoblasts: bodyweight, resistance bands, free weights, and weight machines.',
      src: '/media/osteoporosis/photos/WhatsApp%20Image%202026-10-10%20at%202.30.23%20PM.jpeg',
      category: 'osteoporosis' as const,
      condition: 'osteoporosis' as const,
    },
  ],
}

// Osteoporosis topics for the dual-mode Education Hub
export const OSTEOPOROSIS_TOPICS = [
  {
    id: 'know-osteoporosis',
    tag: 'Bone Biology',
    title: 'Know About Osteoporosis',
    summary:
      'Understand how bone density changes, how osteoclasts and osteoblasts maintain bone, and why bones become porous.',
    content: [
      'Osteoporosis is a metabolic bone condition where the creation of new bone doesn’t keep up with the loss of old bone, causing internal bone architecture to become porous and fragile.',
      'Unlike joints which suffer cartilage wear (Osteoarthritis), osteoporosis is a "silent disease" of bone mineral density. You cannot feel bone loss until a minor bump or fall causes a fracture.',
      'Peak bone mass is achieved around age 30. Maintaining regular weight-bearing exercise, adequate calcium, and Vitamin D levels helps preserve bone structural density for decades.',
    ],
  },
  {
    id: 'osteoporosis-symptoms',
    tag: 'Screening & DEXA',
    title: 'Silent Symptoms & Risk Factors',
    summary:
      'Recognise early indicators like height loss, assess personal fracture risks, and understand DEXA T-scores.',
    content: [
      'Early bone loss typically has zero symptoms. Noticeable warning signs include progressive loss of height (1 inch or more), gradual forward curving of the upper spine (kyphosis or Dowager’s hump), or unprovoked back pain.',
      'A DEXA scan (Dual-energy X-ray Absorptiometry) is the clinical gold standard. A T-score of -1.0 or higher is normal; between -1.0 and -2.5 indicates osteopenia; and -2.5 or lower indicates osteoporosis.',
      'Primary risk factors include post-menopausal estrogen decrease in women, low testosterone in men, low calcium intake, prolonged corticosteroid use, smoking, and family history.',
    ],
  },
  {
    id: 'osteoporosis-diet',
    tag: 'Bone Nutrition',
    title: 'Diet, Calcium & Vitamin D',
    summary:
      'Essential daily nutritional strategies to build and preserve strong mineralized bone matrix.',
    content: [
      'Adults over 50 need approximately 1,200 mg of calcium and 800–1,000 IU of Vitamin D daily. Vitamin D is essential because calcium cannot be absorbed effectively through the intestines without it.',
      'Nutrient-dense sources include yogurt, cheese, fortified tofu, dark leafy greens (kale, broccoli), sesame seeds, almonds, and fatty fish (salmon, sardines).',
      'Avoid excessive sodium, caffeine, and heavy alcohol intake, which promote calcium excretion in urine. Stay well-hydrated to support overall metabolic bone exchange.',
    ],
  },
  {
    id: 'osteoporosis-exercise',
    tag: 'Fall Prevention',
    title: 'Exercise & Fall Prevention',
    summary:
      'Evidence-based mechanical loading, resistance training, and balance drills to trigger bone rebuilding and prevent falls.',
    content: [
      'Bone is dynamic living tissue that responds to mechanical stress. Weight-bearing activities like brisk walking, stair climbing, and resistance exercises stimulate osteoblasts to lay down fresh bone mineral.',
      'Fall prevention is just as crucial as bone density. Balance exercises (such as tandem walking, single-leg stands, and tai chi) dramatically lower the risk of falls—the leading cause of osteoporotic hip and wrist fractures.',
      'Avoid high-impact jumping or extreme twisting of the spine if you have established osteoporosis. Consult a clinical physiotherapist for a personalized, spine-safe loading regimen.',
    ],
  },
]

// All 52 Osteoarthritis photos catalog for full gallery browsing
export const OA_ALL_PHOTO_FILENAMES = [
  '065b4c8f7d8922f7e6c1f771290279bc.jpg',
  '0ccf1cd2bb05239ba69b9e75e1100b93.jpg',
  '101053046faf80e889d45fe305e1b47e.jpg',
  '208316828cf4f950c0f42e16a6b5e3e1.jpg',
  '27c54c0fa43b100bea37c62d76fe8533.jpg',
  '2ca521398e90bee211fd8a51a52221a9.jpg',
  '2d5121f5ef4add72c39ffe59e25c7016.jpg',
  '337205f43697632942a90e78d301301a.jpg',
  '3e6b18d109be3f206e965582f3fa800e.jpg',
  '3f25ce6f95daa51c890577a0c9251e12.jpg',
  '40ed11189d2239fcd2bf5ccdc4f613ba.jpg',
  '418802ab22ecc988a87197050c1f2827.jpg',
  '424d898a826a5938359054b95b9ca43a.jpg',
  '45b3de17d52d0fb5e3d6fdda112bbb1b.jpg',
  '4d9caa138d92b36fcc79cb3e2229236f.jpg',
  '54bb29e85b8ca599001ac62e6d1bb14e.jpg',
  '5743642532117baac108e9c7dd409004.jpg',
  '5775c3cd20973dc1c632ed6b33558a4f.jpg',
  '5c035964851fbaf5e8b1820d76a1dc5f.jpg',
  '5f04b08c2a1555abf0c93b747f4b1fbf.jpg',
  '6606c56ec1c5c15736e8175985930c68.jpg',
  '6750af4c1ef829e2e67b278b4b5570d7.jpg',
  '701306fc6c15e297e9c21357a1cbee59.jpg',
  '714511152cab7aa3eb14847963b85ec5.jpg',
  '71eb8e7ccb8ce9ce85e1730271799528.jpg',
  '74c0da191804babc8cedfc9565dcf52c.jpg',
  '77bca465e2a227a132a9efae17072720.jpg',
  '79e6e5ea813b292186ddcd4cf4406be4.jpg',
  '80e6da1a218a7866b2e02f5897a5ebcd.jpg',
  '830a0b26aa12a7ec0e91766912a93bd8.jpg',
  '8937ca41bc158d78827d82096b1af399.jpg',
  '99a6317fb78b53a33093f3f0499aab74.jpg',
  'a03f9a85d94fcb8fae5daea77daff981.jpg',
  'a0472c098b7bdb38462ed0c4223776df.jpg',
  'af89ad95c52c5082cfad5ecdefa48288.jpg',
  'b32a1eb6d08bfadede02b31cc2831cb5.jpg',
  'b343b032da14415ec001dee2536a1487.jpg',
  'be4589b8724b445544c1ccc302193a24.jpg',
  'c15d33c473d2369d4699d649d12f185d.jpg',
  'c50bde8182e766b2eccb2c1bc65b08ef.jpg',
  'cb59d13d8c5128fc7eedd33fcaf60744.jpg',
  'd4152c19ddfe72c9b97f2c93cf30d5bf.jpg',
  'd4a911658874afdbd9bf9d48fb692f54.jpg',
  'd66cbd25e165e593bde7a6b076797065.jpg',
  'dffbe29d56819c289504c9ceca0f2305.jpg',
  'e152d9b230bc5052d59933c3e1f8bb5b.jpg',
  'e2248155f6fe9db99b445ca1d0c6bb22.jpg',
  'ec138bd19f6cb9e4a8d3061b4b837385.jpg',
  'f218a0699b87861ddaa64ddb582de688.jpg',
  'f432b07b7a39b8c678f50bc5f1b5cf2d.jpg',
  'ffa54d496aca544b2877220a9dd3afc0.jpg',
]

// All 14 Osteoporosis photos catalog
export const OP_ALL_PHOTO_FILENAMES = [
  'WhatsApp Image 2026-10-10 at 2.24.49 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.25.38 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.26.31 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.26.52 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.27.18 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.27.27 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.28.06 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.28.38 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.28.56 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.29.10 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.29.37 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.29.51 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.30.05 PM.jpeg',
  'WhatsApp Image 2026-10-10 at 2.30.23 PM.jpeg',
]

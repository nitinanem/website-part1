export interface ExamQuestion {
  id: string
  topicId: 'know-oa' | 'symptoms' | 'diet' | 'exercise' | 'osteoporosis'
  condition: 'oa' | 'osteoporosis'
  vignette: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  clinicalDomain: string
}

export const EXAM_QUESTION_BANK: ExamQuestion[] = [
  // ── Osteoarthritis (OA) Vignettes ──────────────────────────────────────────
  {
    id: 'oa-q1',
    topicId: 'know-oa',
    condition: 'oa',
    vignette:
      'A 62-year-old retired schoolteacher presents with bilateral knee aching that is worse after standing for 2 hours. Physical examination reveals joint crepitus but no systemic fever or skin erythema. An MRI shows early articular cartilage thinning.',
    question: 'Why does early articular cartilage damage frequently develop without sharp initial pain?',
    options: [
      'Hyaline articular cartilage is aneural (lacks sensory nerve endings); pain only begins when subchondral bone or the synovium is irritated',
      'The cartilage contains natural high-dose local endorphins that anesthetize the joint continuously',
      'Pain receptors in synovial fluid only activate when cartilage is 100% completely gone',
      'Nerve fibers in knee joints only transmit temperature sensations, not mechanical friction',
    ],
    correctIndex: 0,
    explanation:
      'Hyaline cartilage has no blood supply, lymphatics, or nerves (aneural and avascular). Pain in osteoarthritis arises from subchondral bone pressure, synovial inflammation, periarticular muscle spasm, and joint capsule distension.',
    clinicalDomain: 'Articular Biomechanics & Histology',
  },
  {
    id: 'oa-q2',
    topicId: 'symptoms',
    condition: 'oa',
    vignette:
      'A 58-year-old accountant complains of morning knee stiffness that makes it difficult to get out of bed. However, after taking a warm shower and walking around for 15 to 20 minutes, the stiffness eases considerably.',
    question: 'How does the duration of morning stiffness distinguish Osteoarthritis (OA) from Rheumatoid Arthritis (RA)?',
    options: [
      'OA stiffness typically resolves within 30 minutes of gentle movement, whereas inflammatory RA stiffness persists for more than 60 minutes',
      'OA morning stiffness always lasts longer than 2 hours every day',
      'RA has zero morning stiffness, while OA causes whole-day immobility',
      'There is no clinical difference in morning stiffness duration between OA and RA',
    ],
    correctIndex: 0,
    explanation:
      'According to ACR and EULAR clinical guidelines, morning stiffness in mechanical Osteoarthritis is classic "gelling" that lasts less than 30 minutes and eases with movement. In contrast, autoimmune Rheumatoid Arthritis features persistent morning stiffness exceeding 60 minutes.',
    clinicalDomain: 'Clinical Differential Diagnosis',
  },
  {
    id: 'oa-q3',
    topicId: 'diet',
    condition: 'oa',
    vignette:
      'A 65-year-old patient with Grade 2 knee OA asks what nutritional adjustments have evidence-based support to attenuate chronic joint discomfort and systemic inflammation.',
    question: 'Which dietary pattern and biomarker mechanism is clinically substantiated to reduce joint inflammation?',
    options: [
      'A Mediterranean diet rich in Omega-3 fatty acids and polyphenols, which lowers systemic C-reactive protein (CRP) and inhibits synovial cytokines',
      'A strictly raw fruit diet eliminating all dietary protein and calcium',
      'High consumption of saturated animal fats to grease the internal knee joints',
      'Complete elimination of water intake to reduce joint fluid swelling',
    ],
    correctIndex: 0,
    explanation:
      'Clinical trials demonstrate that Mediterranean diets high in Omega-3 fatty acids (EPA/DHA), olive oil polyphenols, and antioxidants suppress inflammatory prostaglandins and lower systemic CRP, relieving joint tenderness.',
    clinicalDomain: 'Nutritional Biochemistry',
  },
  {
    id: 'oa-q4',
    topicId: 'exercise',
    condition: 'oa',
    vignette:
      'A patient with mild-to-moderate knee OA was advised by a neighbor to rest in bed and avoid all walking or knee bending to "save" the remaining cartilage from wearing out.',
    question: 'Why is bed rest contraindicated and cyclic, low-impact exercise beneficial for joint cartilage?',
    options: [
      'Cartilage relies on cyclic compression and release ("motion is lotion") to pump nutrient-rich synovial fluid into chondrocytes, while bed rest causes cartilage starvation and muscle atrophy',
      'Bed rest increases bone mineral density too rapidly, causing the knee joint to fuse',
      'Resting in bed causes the knee cartilage to grow excessively thick and obstruct movement',
      'Exercise completely replaces lost cartilage with brand new meniscus tissue within 48 hours',
    ],
    correctIndex: 0,
    explanation:
      'Because cartilage has no blood vessels, it depends entirely on the mechanical "sponge effect": cyclic loading forces metabolic wastes out, and unloading pulls nutrient-rich synovial fluid in. Immobility leads to rapid cartilage degradation and quadriceps weakness.',
    clinicalDomain: 'Rehabilitation & Exercise Physiology',
  },
  {
    id: 'oa-q5',
    topicId: 'exercise',
    condition: 'oa',
    vignette:
      'An overweight 54-year-old male with early medial compartment knee OA asks how much impact reduction he can expect by losing weight.',
    question: 'What is the biomechanical load multiplier on the human knee joint during normal walking?',
    options: [
      'Every 1 kg of body weight lost removes approximately 4 kg of mechanical joint pressure per step',
      'Losing weight has zero effect on knee joint pressure',
      'Every 1 kg lost increases joint shock by 10x due to lighter momentum',
      'Knee joint force is exactly 0.1x body weight regardless of body mass',
    ],
    correctIndex: 0,
    explanation:
      'Biomechanical gait analysis shows that during the stance phase of walking, ground reaction forces and muscle pull generate 3 to 4 times body weight across the tibiofemoral joint. A 5 kg weight loss removes up to 20 kg of cumulative stress per stride.',
    clinicalDomain: 'Biomechanical Kinetics',
  },

  // ── Osteoporosis (OP) Vignettes ──────────────────────────────────────────
  {
    id: 'op-q1',
    topicId: 'osteoporosis',
    condition: 'osteoporosis',
    vignette:
      'A 67-year-old female undergoes routine clinical screening. She notes she has lost 1.8 inches of height over the past 4 years and notices a gradual forward curvature in her upper thoracic back (Dowager’s hump). She has never experienced an acute traumatic fall.',
    question: 'What is the most probable pathophysiological mechanism responsible for this height loss?',
    options: [
      'Silent, asymptomatic osteoporotic vertebral wedge compression fractures caused by weakened trabecular bone',
      'Temporary muscle fatigue in the cervical spine that can be stretched out in one day',
      'Natural shrinkage of the skull bones after menopause',
      'Loss of abdominal subcutaneous fat pulling the ribs downward',
    ],
    correctIndex: 0,
    explanation:
      'Silent osteoporotic micro-fractures in the anterior thoracic vertebrae cause anterior wedge collapse. Multiple compression fractures result in loss of vertebral body height, leading to overall height reduction and progressive dorsal kyphosis.',
    clinicalDomain: 'Skeletal Pathology & Diagnostics',
  },
  {
    id: 'op-q2',
    topicId: 'osteoporosis',
    condition: 'osteoporosis',
    vignette:
      'A patient receives a Dual-Energy X-Ray Absorptiometry (DEXA) report for the femoral neck showing a T-score of -2.7.',
    question: 'According to World Health Organization (WHO) diagnostic criteria, how is this result categorized?',
    options: [
      'Osteoporosis (T-score is -2.5 or lower, indicating severe loss of bone mineral density)',
      'Completely normal bone density (T-score above -3.0 is normal)',
      'Osteopenia (T-score must be below -4.0 to qualify as osteoporosis)',
      'Acute bone infection requiring intravenous antibiotics',
    ],
    correctIndex: 0,
    explanation:
      'WHO criteria specify: T-score ≥ -1.0 is Normal; T-score between -1.0 and -2.5 is Osteopenia; and T-score ≤ -2.5 is clinical Osteoporosis, representing high risk of fragility fractures.',
    clinicalDomain: 'DEXA Densitometry & WHO Standards',
  },
  {
    id: 'op-q3',
    topicId: 'osteoporosis',
    condition: 'osteoporosis',
    vignette:
      'A 70-year-old grandfather is taking 1,200 mg of calcium carbonate supplements daily but neglects sunlight exposure and consumes no dietary Vitamin D. His follow-up bone density scan shows continuing bone loss.',
    question: 'Why is Vitamin D biologically indispensable alongside calcium supplementation for bone health?',
    options: [
      'Active Vitamin D (Calcitriol) is required for intestinal calcium transport; without it, dietary calcium passes unabsorbed and PTH stimulates bone resorption',
      'Vitamin D is only a flavor additive to make calcium tablets taste better',
      'Vitamin D destroys osteoclasts within minutes so calcium can float freely in veins',
      'Calcium is directly converted into Vitamin D by stomach acid',
    ],
    correctIndex: 0,
    explanation:
      'Active 1,25-dihydroxyvitamin D3 stimulates active transcellular calcium absorption in the duodenum and jejunum. In Vitamin D deficiency, only 10–15% of ingested calcium is absorbed, triggering secondary hyperparathyroidism that strips calcium from bones.',
    clinicalDomain: 'Endocrinology & Mineral Metabolism',
  },
  {
    id: 'op-q4',
    topicId: 'osteoporosis',
    condition: 'osteoporosis',
    vignette:
      'A clinical team is designing a physical therapy fall-prevention protocol for elderly patients residing in an assisted living facility who have diagnosed osteopenia.',
    question: 'Which exercise regimen is proven to reduce fracture risk both through bone stimulus and neuromotor balance?',
    options: [
      'Dynamic weight-bearing exercises (brisk walking, chair squats) combined with tandem balance drills and quadriceps resistance',
      'High-impact trampolining and rapid spinal twisting yoga poses',
      'Complete bed rest to eliminate any opportunity to trip or fall',
      'Passive hot water immersion without any standing or muscle exertion',
    ],
    correctIndex: 0,
    explanation:
      'Evidence-based geriatric protocols combine progressive resistance training (stimulating osteoblasts via piezoelectric mechanical strain) with dynamic equilibrium training (tandem stance, single-leg stands) to prevent falls—the trigger for 95% of hip fractures.',
    clinicalDomain: 'Geriatric Fall Prevention',
  },
  {
    id: 'op-q5',
    topicId: 'osteoporosis',
    condition: 'osteoporosis',
    vignette:
      'A 64-year-old woman with a family history of hip fractures asks why bone remodeling becomes unbalanced following menopause.',
    question: 'What cellular role does estrogen play in regulating osteoblasts and osteoclasts?',
    options: [
      'Estrogen promotes osteoclast apoptosis and limits RANKL signaling; post-menopausal estrogen withdrawal accelerates osteoclast survival and bone resorption',
      'Estrogen completely halts bone creation until age 50',
      'Estrogen converts bone matrix into liquid collagen',
      'Estrogen only affects skin elasticity and has zero interaction with bone cells',
    ],
    correctIndex: 0,
    explanation:
      'Estrogen exerts a critical protective brake on bone resorption by suppressing RANKL and pro-inflammatory cytokines while promoting osteoclast apoptosis. Loss of estrogen uncouples remodeling, causing osteoclastic resorption pits to outpace osteoblastic matrix synthesis.',
    clinicalDomain: 'Cellular Bone Biology & RANKL Pathway',
  },
]

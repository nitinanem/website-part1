// ─── Core enumerations ────────────────────────────────────────────────────────

/**
 * Lifecycle of a single assessment session.
 * draft      → intake wizard in progress (not yet submitted)
 * submitted  → sent to backend for processing; awaiting risk score
 * pending_review → backend result ready; awaiting clinician sign-off
 * confirmed  → clinician confirmed the AI result
 * flagged    → clinician flagged for a second opinion
 */
export type AssessmentStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'confirmed'
  | 'flagged'

/** Kellgren–Lawrence radiographic grading scale (0 = none, 4 = severe). */
export type KLGrade = 0 | 1 | 2 | 3 | 4

/** Self-reported body type — used as a qualitative input to the model. */
export type BodyType = 'slim' | 'average' | 'athletic' | 'overweight'

// ─── Sub-types ─────────────────────────────────────────────────────────────────

export type Anthropometrics = {
  heightCm: number
  weightKg: number
  /** Computed by the backend; stored here for display. // PLACEHOLDER */
  bmi: number
  bodyType: BodyType
}

/**
 * Single WOMAC/KOOS-style Likert response.
 * score 0 = none / no difficulty, 4 = extreme.
 */
export type WomacKoosAnswer = {
  questionId: string
  score: number // 0–4 // PLACEHOLDER — scale confirmed by backend
}

export type WomacKoosQuestion = {
  id: string
  subscale: 'pain' | 'stiffness' | 'function'
  text: string
}

/**
 * A single feature-importance entry from the backend LIME explainer.
 * All values are backend-provided; the frontend only renders them. // PLACEHOLDER
 */
export type LimeFactor = {
  feature: string
  /** 0–1 contribution weight. // PLACEHOLDER */
  weight: number
  direction: 'risk' | 'protective'
}

export type RiskScore = {
  /** 0–100 combined fused score. // PLACEHOLDER — from backend fusion */
  combined: number
  /** 0–100 camera/gait-derived sub-score. // PLACEHOLDER */
  gait: number
  /** 0–100 questionnaire/clinical sub-score. // PLACEHOLDER */
  clinical: number
  /**
   * 0–1 confidence of the fusion model.
   * If below the backend threshold → fallback = true. // PLACEHOLDER
   */
  confidence: number
  /**
   * When true, display KL grade only; hide fused score.
   * Backend sets this when fusion confidence is too low. // PLACEHOLDER
   */
  fallback: boolean
  klGrade: KLGrade | null
  limeFactors: LimeFactor[]
}

// ─── Assessment (top-level) ────────────────────────────────────────────────────

export type Assessment = {
  id: string
  patientId: string
  patientName?: string | null
  patientEmail?: string | null
  patientPhone?: string | null
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
  status: AssessmentStatus
  /** Reference to gait video stored on backend. // PLACEHOLDER */
  gaitVideoRef: string | null
  /** Reference to X-ray image stored on backend. // PLACEHOLDER */
  xrayRef: string | null
  anthropometrics: Anthropometrics | null
  answers: WomacKoosAnswer[]
  /** null until backend processes the submission. */
  riskScore: RiskScore | null
  /** Staff member ID who reviewed this result. */
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNote: string | null
  /** Distinguishes patient self-service from clinic-administered CRF. */
  source: 'patient_self' | 'clinic_admin'
}

// ─── Patient ───────────────────────────────────────────────────────────────────

export type Patient = {
  id: string
  name: string
  age: number
  phone: string
  email: string
  gender?: string
  primaryJoint?: string
  abhaId?: string
  emergencyContact?: string
  allottedDoctorId?: string
  latestAssessmentId: string | null
  latestAssessmentStatus: AssessmentStatus | null
}

export type Doctor = {
  id: string
  name: string
  specialization: string
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp?: number
  /** Present on assistant messages to show loading state. */
  loading?: boolean
  error?: boolean
  sources?: string[]
  sessionId?: string
}

export type ChatSession = {
  id: string
  timestamp: number
  messages: ChatMessage[]
}

// ─── Journal ───────────────────────────────────────────────────────────────────

export type SentimentFlag = 'neutral' | 'concerning'

export type JournalEntry = {
  id: string
  patientId: string
  date: string
  painLevel: number
  location: string
  notes: string
  sentiment: SentimentFlag
  mobilityScore?: number
  klGrade?: number
  radiologyRecommended?: boolean
  imageUrl?: string
  audioUrl?: string
  createdAt?: string
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export type Language = 'en' | 'hi' | 'pa' | 'bn' | 'as'

export type WhatsAppPreference = {
  enabled: boolean
  /** E.164 format expected by backend. // PLACEHOLDER */
  phone: string
}

export type UserSettings = {
  patientId: string
  language: Language
  dailyReminders: boolean
  weeklyEmail: boolean
  whatsApp: WhatsAppPreference
}

// ─── Clinic CRF ────────────────────────────────────────────────────────────────

export type CRFData = {
  anthropometrics: Anthropometrics
  answers: WomacKoosAnswer[]
  klGrade: KLGrade
  xrayRef: string | null
  notes: string
}

export type ReviewAction = 'confirm' | 'flag'

export type ReviewRequest = {
  action: ReviewAction
  note: string
}

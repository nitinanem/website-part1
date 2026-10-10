// ─── Dictionary type ──────────────────────────────────────────────────────────
// Every locale file (en.ts, hi.ts, pa.ts, bn.ts, as.ts) must satisfy this
// interface exactly. TypeScript will catch any missing or mistyped strings.

export interface EducationTopicDict {
  id: string
  title: string
  tag: string
  summary: string
  content: string[]
}

export interface StudyTakeawayDict {
  title: string
  description: string
}

export interface StudySectionDict {
  heading: string
  body: string[]
  keyPoints?: string[]
  highlight?: string
}

export interface StudyActionPlanDict {
  title: string
  dos: string[]
  donts: string[]
}

export interface StudyQuizQuestionDict {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface StudyReferenceDict {
  title: string
  authors: string
  source?: string
  journal?: string
  year: string
  url?: string
}

export interface StudyPageDetailDict {
  id: 'know-oa' | 'symptoms' | 'diet' | 'exercise'
  tag: string
  title: string
  subtitle: string
  readTime: string
  level: string
  keyTakeaways: StudyTakeawayDict[]
  sections: StudySectionDict[]
  actionPlan: StudyActionPlanDict
  quiz: StudyQuizQuestionDict[]
  references: StudyReferenceDict[]
}

export interface AudioGuideDict {
  listenFullPage: string
  listenSection: string
  listenTopic: string
  playingAudio: string
  audioPaused: string
  pause: string
  resume: string
  stop: string
  speed: string
  voice: string
  readingSection: string
  audioGuideTitle: string
  interactiveVisuals: string
  viewDiagram: string
  closeDiagram: string
}

export interface StudyHubDict {
  backToHub: string
  startStudy: string
  studyGuideBadge: string
  estimatedTime: string
  targetAudience: string
  tableOfContents: string
  keyTakeawaysTitle: string
  deepDiveTitle: string
  actionPlanTitle: string
  dosTitle: string
  dontsTitle: string
  quizTitle: string
  quizSubtitle: string
  checkAnswer: string
  correctFeedback: string
  incorrectFeedback: string
  referencesTitle: string
  referencesSubtitle: string
  prevModule: string
  nextModule: string
  allModules: string
  audioGuide: AudioGuideDict
  pages: {
    'know-oa': StudyPageDetailDict
    symptoms: StudyPageDetailDict
    diet: StudyPageDetailDict
    exercise: StudyPageDetailDict
  }
}

export interface Dictionary {
  // ── Shared / Common ──────────────────────────────────────────────────────
  common: {
    brandName: string
    loading: string
    save: string
    saving: string
    saved: string
    back: string
    continue: string
    cancel: string
    submit: string
    submitting: string
    optional: string
    remove: string
    viewAll: string
    close: string
    search: string
    clearSearch: string
    error: string
    tryAgain: string
    or: string
    yes: string
    no: string
    startOver: string
    processing: string
    none: string
  }

  // ── Public Navigation ─────────────────────────────────────────────────────
  nav: {
    education: string
    doctorCheck: string
    loginPortal: string
    exitStaffPortal: string
    backToHome: string
  }

  // ── Public Hero ───────────────────────────────────────────────────────────
  hero: {
    badge: string
    title: string
    subtitle: string
    exploreCta: string
    portalCta: string
    statFigure: string
    statDesc: string
    trust1: string
    trust2: string
    trust3: string
    scrollHint: string
    footerDisclaimer: string
  }

  // ── Education Hub ─────────────────────────────────────────────────────────
  education: {
    badge: string
    title: string
    subtitle: string
    searchPlaceholder: string
    resultsCount: string // use {count} and {query} as placeholders
    noResults: string    // use {query}
    topics: EducationTopicDict[]
  }

  // ── Doctor Self-Check ─────────────────────────────────────────────────────
  doctorCheck: {
    badge: string
    title: string
    subtitle: string
    answeredOf: string // use {done} and {total}
    seeRecommendation: string
    questions: { id: string; text: string }[]
    highRiskTitle: string
    highRiskBody: string
    lowRiskTitle: string
    lowRiskBody: string
    disclaimer: string
    startOver: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    downloadReport: string
    downloadingReport: string
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    welcomeBack: string
    createAccount: string
    loginSubtitle: string
    signupSubtitle: string
    patientRole: string
    staffRole: string
    signInTab: string
    signUpTab: string
    fullNameLabel: string
    emailLabel: string
    passwordLabel: string
    signInBtn: string
    signUpBtn: string
    demoNotice: string
    privacyBadge: string
    ageLabel: string
    genderLabel: string
    genderMale: string
    genderFemale: string
    genderOther: string
    abhaIdLabel: string
    abhaIdPlaceholder: string
    pictureLabel: string
    verifyLabel: string
  }

  // ── Dashboard Navigation ──────────────────────────────────────────────────
  dashNav: {
    home: string
    assessments: string
    journal: string
    progress: string
    assistant: string
    settings: string
    logout: string
  }

  // ── Dashboard Home ────────────────────────────────────────────────────────
  dashHome: {
    greetingPrefix: string
    motivationText: string
    logPainCta: string
    assessmentCardTitle: string
    latestScore: string
    noAssessmentYet: string
    startFirstAssessment: string
    newAssessment: string
    avgPainLabel: string
    avgPainHint: string
    streakLabel: string
    streakHint: string
    exercisesLabel: string
    exercisesHint: string
    progressQuickTitle: string
    progressQuickDesc: string
    assistantQuickTitle: string
    assistantQuickDesc: string
  }

  // ── Pain Journal ──────────────────────────────────────────────────────────
  journal: {
    title: string
    subtitle: string
    painLevelLabel: string
    mild: string
    moderate: string
    severe: string
    locationLabel: string
    locations: string[]
    notesLabel: string
    notesPlaceholder: string
    saveEntry: string
    recentEntries: string
    concerningBadge: string
    noEntries: string
  }

  // ── Health Progress ───────────────────────────────────────────────────────
  progress: {
    title: string
    subtitle: string
    chartTitle: string
    chartHint: string
    improvingBadge: string
    todaysPlan: string
    exerciseTitle: string
    exercises: string[]
    downloadReport: string
    weeklyReport: string
    monthlyReport: string
    generatingReport: string
  }

  // ── Personal AI / Assistant ───────────────────────────────────────────────
  assistant: {
    title: string
    subtitle: string
    chatTitle: string
    chatSubtitle: string
    ragBadge: string
    initialGreeting: string
    suggestions: string[]
    inputPlaceholder: string
    thinking: string
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    title: string
    subtitle: string
    profileSection: string
    editProfile: string
    careTeamSection: string
    assignedDoctor: string
    selectDoctor: string
    dailyRemindersTitle: string
    dailyRemindersDesc: string
    weeklyEmailTitle: string
    weeklyEmailDesc: string
    languageTitle: string
    languageDesc: string
    whatsAppTitle: string
    whatsAppDesc: string
    whatsAppPhoneLabel: string
    whatsAppPhonePlaceholder: string
    whatsAppNote: string
  }

  // ── Assessment Wizard ─────────────────────────────────────────────────────
  wizard: {
    title: string
    stepSubtitle: string // use {step} and {total}
    draftSaved: string
    steps: {
      gait: string
      measurements: string
      questionnaire: string
      xray: string
    }
    gait: {
      title: string
      desc: string
      recordBtn: string
      recordHint: string
      requestingCamera: string
      stopRecording: string
      recTime: string // use {sec} and {max}
      noSupport: string
      orUpload: string
      chooseFile: string
      fileHint: string
      reRecord: string
    }
    measurements: {
      title: string
      desc: string
      unitMetric: string
      unitImperial: string
      heightCm: string
      heightFtIn: string
      heightFt: string
      heightIn: string
      weightKg: string
      weightLbs: string
      bmiLabel: string
      bmiPlaceholder: string
      bodyTypeTitle: string
      slim: string
      slimDesc: string
      average: string
      averageDesc: string
      athletic: string
      athleticDesc: string
      overweight: string
      overweightDesc: string
    }
    questionnaire: {
      title: string
      desc: string
      answeredOf: string // use {done} and {total}
      subscalePain: string
      subscaleStiffness: string
      subscaleFunction: string
      // Likert scale labels (0–4)
      likert: string[]
      // WOMAC questions — marked REVIEW on non-English locales
      questions: { id: string; subscale: 'pain' | 'stiffness' | 'function'; text: string }[]
    }
    xray: {
      title: string
      desc: string
      uploadLabel: string
      uploadHint: string
      chooseFile: string
      skipBtn: string
    }
    submitBtn: string
    successTitle: string
    successDesc: string
  }

  // ── Assessment History ────────────────────────────────────────────────────
  assessmentHistory: {
    title: string
    subtitle: string
    newAssessment: string
    noAssessmentsYet: string
    noAssessmentsDesc: string
    startAssessment: string
    riskScore: string
    lowConfidence: string
    clinicAdministered: string
    selfService: string
  }

  // ── Assessment Results ────────────────────────────────────────────────────
  results: {
    title: string
    selfService: string
    clinicAdmin: string
    lowRisk: string
    moderateRisk: string
    highRisk: string
    combinedScoreTitle: string
    combinedScoreDesc: string // use {confidence}
    gaitSubscore: string
    clinicalSubscore: string
    klGradeTitle: string
    klGradeDesc: string
    klGrades: string[] // index 0–4
    fallbackTitle: string
    fallbackDesc: string // use {confidence}
    limeTitle: string
    limeDesc: string
    riskDirection: string
    protectiveDirection: string
    clinicianNoteTitle: string
    reviewedByLabel: string // use {reviewer} and {date}
    processing: string
    statusBadges: {
      draft: string
      submitted: string
      pending_review: string
      confirmed: string
      flagged: string
    }
  }

  // ── Assessment History ────────────────────────────────────────────────────
  history: {
    title: string
    subtitle: string
    newBtn: string
    noAssessments: string
    startFirstBtn: string
    scoreLabel: string
    fallbackLabel: string
    selfService: string
    clinicAdmin: string
  }

  // ── Clinic / Staff ────────────────────────────────────────────────────────
  clinic: {
    authTitle: string
    authSubtitle: string
    notForPatient: string
    emailLabel: string
    passwordLabel: string
    signInBtn: string
    demoNotice: string
    patientLookupTitle: string
    patientLookupSubtitle: string
    patientSearchPlaceholder: string
    noPatients: string
    reviewQueueTitle: string
    reviewQueueSubtitle: string
    emptyQueue: string
    reviewTitle: string
    patientLabel: string
    topFactors: string
    confirmBtn: string
    flagBtn: string
    noteLabel: string
    notePlaceholder: string
    confirmedMsg: string
    flaggedMsg: string
    klOnlyBadge: string
    klGradeLabel: string
  }

  // ── Public Chatbot ────────────────────────────────────────────────────────
  chatbot: {
    headerTitle: string
    headerSubtitle: string
    inputPlaceholder: string
    listenBtn: string
    playing: string
    greeting: string
    replies: string[]
  }

  // ── Contact / Query ───────────────────────────────────────────────────────
  contact: {
    publicTitle: string
    publicSubtitle: string
    namePlaceholder: string
    emailPlaceholder: string
    messagePlaceholder: string
    sendBtn: string
    successAlert: string
    patientTitle: string
    patientSubtitle: string
    patientMessagePlaceholder: string
    patientSendBtn: string
    patientSuccessAlert: string
    supportBadge?: string
    helplineTitle?: string
    helplineHours?: string
    aiAssistantBadge?: string
    aiAssistantDesc?: string
    emailSupportTitle?: string
    confidentialNote?: string
    dictateQuery?: string
    dictating?: string
    topicGeneral?: string
    topicClinical?: string
    topicDiet?: string
    topicFeedback?: string
    successTitle?: string
    sendAnother?: string
  }

  // ── Study Hub (4 Dedicated Study Pages) ──────────────────────────────────
  study: StudyHubDict

  // ── Voice Form Assistant (Elderly Accessibility) ──────────────────────────
  voiceAssistant: {
    startVoiceBtn: string
    listeningBadge: string
    speakingBadge: string
    stopVoiceBtn: string
    greetingPrompt: string
    namePrompt: string
    agePrompt: string
    genderPrompt: string
    phonePrompt: string
    reviewPrompt: string
    submitPrompt: string
    repeatBtn: string
    nextBtn: string
    prevBtn: string
    unsupportedMsg: string
    micDeniedMsg: string
    youSaid: string
    seniorHelpHint: string
    seniorCareBadge: string
    listeningPlaceholder: string
  }
}

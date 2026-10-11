/**
 * prisma/seed.ts
 * Run with: npx prisma db seed
 * Seeds the DB with initial doctors and a test patient/clinician.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Create clinician users + doctor profiles ───────────────────────────────
  const doctorSeeds = [
    { email: 'dr.sharma@jointcare.in', name: 'Dr. A. Sharma', spec: 'Orthopedics' },
    { email: 'dr.gupta@jointcare.in',  name: 'Dr. R. Gupta',  spec: 'Physiotherapy' },
    { email: 'dr.patel@jointcare.in',  name: 'Dr. M. Patel',  spec: 'Rheumatology' },
  ]

  const clinicianPassword = await bcrypt.hash('Clinic@123', 12)

  for (const d of doctorSeeds) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {},
      create: {
        email: d.email,
        name: d.name,
        password: clinicianPassword,
        role: 'CLINICIAN',
        emailVerified: new Date(),
      },
    })
    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: d.name,
        specialization: d.spec,
      },
    })
    console.log(`  ✓ Doctor: ${d.name} (${d.email})`)
  }

  // ── Create a demo patient ──────────────────────────────────────────────────
  const patientPassword = await bcrypt.hash('Patient@123', 12)
  const patientUser = await prisma.user.upsert({
    where: { email: 'aman.sharma@example.com' },
    update: {},
    create: {
      email: 'aman.sharma@example.com',
      name: 'Aman Sharma',
      password: patientPassword,
      role: 'PATIENT',
      emailVerified: new Date(),
    },
  })

  const drSharma = await prisma.doctor.findFirst({ where: { name: 'Dr. A. Sharma' } })

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      name: 'Aman Sharma',
      email: 'aman.sharma@example.com',
      age: 54,
      phone: '+91 98765 43210',
      gender: 'male',
      primaryJoint: 'Right Knee',
      abhaId: '91-4820-9182-3849',
      emergencyContact: '+91 98765 00000 (Spouse)',
      allottedDoctorId: drSharma?.id ?? null,
      settings: {
        create: {
          language: 'en',
          dailyReminders: true,
          weeklyEmail: false,
        },
      },
    },
  })
  console.log('  ✓ Patient: Aman Sharma (aman.sharma@example.com)')

  // ── Seed Historical Journal Entries for Demo Account ───────────────────────
  const historicalEntries = [
    {
      patientId: patient.id,
      date: '2026-09-01',
      painLevel: 7,
      location: 'Right Knee',
      notes: 'Difficult day with persistent morning stiffness. Pain interrupted sleep.',
      sentiment: 'neutral' as const,
      mobilityScore: 58,
      klGrade: 2,
      createdAt: new Date('2026-09-01T09:00:00Z'),
    },
    {
      patientId: patient.id,
      date: '2026-09-02',
      painLevel: 6,
      location: 'Right Knee',
      notes: 'Started knee mobility exercises. Discomfort climbing stairs.',
      sentiment: 'neutral' as const,
      mobilityScore: 64,
      klGrade: 2,
      createdAt: new Date('2026-09-02T09:00:00Z'),
    },
    {
      patientId: patient.id,
      date: '2026-09-03',
      painLevel: 6,
      location: 'Right Knee',
      notes: 'Gentle 15-minute walk. Swelling slightly noticeable in afternoon.',
      sentiment: 'neutral' as const,
      mobilityScore: 67,
      klGrade: 2,
      createdAt: new Date('2026-09-03T09:00:00Z'),
    },
    {
      patientId: patient.id,
      date: '2026-09-04',
      painLevel: 5,
      location: 'Right Knee',
      notes: 'Stiffness eased faster today. Better flexion while sitting.',
      sentiment: 'neutral' as const,
      mobilityScore: 72,
      klGrade: 2,
      createdAt: new Date('2026-09-04T09:00:00Z'),
    },
    {
      patientId: patient.id,
      date: '2026-09-05',
      painLevel: 4,
      location: 'Right Knee',
      notes: 'Noticeable reduction in ache after morning routine.',
      sentiment: 'neutral' as const,
      mobilityScore: 78,
      klGrade: 2,
      createdAt: new Date('2026-09-05T09:00:00Z'),
    },
    {
      patientId: patient.id,
      date: '2026-09-06',
      painLevel: 4,
      location: 'Right Knee',
      notes: 'Walking cadence feels more symmetric. Able to walk unassisted.',
      sentiment: 'neutral' as const,
      mobilityScore: 81,
      klGrade: 2,
      createdAt: new Date('2026-09-06T09:00:00Z'),
    },
    {
      patientId: patient.id,
      date: '2026-09-07',
      painLevel: 3,
      location: 'Right Knee',
      notes: 'Significant improvement over the week. Minimal pain during routine tasks.',
      sentiment: 'neutral' as const,
      mobilityScore: 85,
      klGrade: 2,
      createdAt: new Date('2026-09-07T09:00:00Z'),
    },
  ]

  const existingJournalCount = await prisma.journalEntry.count({ where: { patientId: patient.id } })
  if (existingJournalCount === 0) {
    for (const e of historicalEntries) {
      await prisma.journalEntry.create({ data: e })
    }
    console.log(`  ✓ Seeded ${historicalEntries.length} historical journal entries for Aman Sharma`)
  }

  // ── Seed Assessment for Demo Account ──────────────────────────────────────
  const existingAssessmentCount = await prisma.assessment.count({ where: { patientId: patient.id } })
  if (existingAssessmentCount === 0) {
    await prisma.assessment.create({
      data: {
        patientId: patient.id,
        status: 'confirmed',
        source: 'patient_self',
        gaitVideoRef: 'gait_sample_baseline.webm',
        anthropometrics: JSON.stringify({ heightCm: 172, weightKg: 74, bmi: 25.0 }),
        answers: JSON.stringify([{ questionId: 'q-p1', score: 2 }, { questionId: 'q-s1', score: 2 }]),
        riskScore: JSON.stringify({ combined: 52, confidence: 0.86, klGrade: 2 }),
        reviewedBy: drSharma?.name ?? 'Dr. A. Sharma',
        reviewedAt: new Date('2026-09-02T10:00:00Z'),
        reviewNote: 'Baseline assessment confirmed. Mild medial compartment narrowing.',
      },
    })
    console.log('  ✓ Seeded baseline clinical assessment for Aman Sharma')
  }

  console.log('\n✅ Seeding complete!')
  console.log('   Patient login  → aman.sharma@example.com / Patient@123')
  console.log('   Clinician login → dr.sharma@jointcare.in / Clinic@123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

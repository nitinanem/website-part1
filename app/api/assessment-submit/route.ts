import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { MongoClient } from 'mongodb'

let cachedClient: MongoClient | null = null

async function getMongoClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) return null
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }
  return cachedClient
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, email, phone, age, gender, score, recommendation, answers, timestamp } = data

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const patientName = name.trim()
    const rawEmail = (email && email.trim()) ? email.trim().toLowerCase() : null
    const patientPhone = (phone && phone.trim()) ? phone.trim() : null
    const patientEmail = rawEmail || `walkin.${Date.now()}.${Math.random().toString(36).substring(2, 7)}@jointcare.local`
    const parsedAge = parseInt(String(age), 10) || null
    const patientGender = gender || null

    // 1. Locate or create Patient in PostgreSQL
    let patient = null

    if (rawEmail) {
      patient = await prisma.patient.findFirst({
        where: { email: rawEmail },
      })
    } else if (patientPhone) {
      // If no email entered, match only if name also matches to avoid merging different people sharing a family phone
      patient = await prisma.patient.findFirst({
        where: {
          phone: patientPhone,
          name: { equals: patientName, mode: 'insensitive' },
        },
      })
    }

    if (!patient) {
      let user = await prisma.user.findUnique({
        where: { email: patientEmail },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: patientName,
            email: patientEmail,
            role: 'PATIENT',
          },
        })
      }

      patient = await prisma.patient.create({
        data: {
          userId: user.id,
          name: patientName,
          email: patientEmail,
          phone: patientPhone,
          age: parsedAge,
          gender: patientGender,
          primaryJoint: 'Knee',
        },
      })
    } else {
      // Update with newly provided details
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          name: patientName,
          ...(parsedAge ? { age: parsedAge } : {}),
          ...(patientGender ? { gender: patientGender } : {}),
          ...(patientPhone ? { phone: patientPhone } : {}),
          ...(rawEmail ? { email: rawEmail } : {}),
        },
      })
    }

    // Format answers into structured JSON
    const formattedAnswers =
      typeof answers === 'object' && answers !== null
        ? Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          }))
        : []

    // 2. Insert into PostgreSQL Assessment table with explicit patientName, patientEmail, patientPhone
    const assessment = await prisma.assessment.create({
      data: {
        patientId: patient.id,
        patientName: patientName,
        patientEmail: rawEmail || patient.email,
        patientPhone: patientPhone || patient.phone,
        status: 'pending_review',
        source: 'patient_self',
        anthropometrics: JSON.stringify({
          name: patientName,
          email: rawEmail || patient.email,
          phone: patientPhone || patient.phone,
          age: parsedAge ?? patient.age,
          gender: patientGender ?? patient.gender,
        }),
        answers: JSON.stringify(formattedAnswers),
        riskScore: JSON.stringify({
          score: Number(score) || 0,
          recommendation: recommendation || (Number(score) >= 3 ? 'high' : 'low'),
          source: 'public_doctor_check',
          klGrade: Number(score) >= 3 ? 2 : 1,
        }),
      },
    })

    // 3. Optional secondary write to MongoDB if configured
    try {
      const mongoClient = await getMongoClient()
      if (mongoClient) {
        const db = mongoClient.db('jointcare')
        await db.collection('public_assessments').insertOne({
          name: patientName,
          email: patientEmail,
          phone: patientPhone,
          age: parsedAge,
          gender: patientGender,
          score,
          recommendation,
          assessmentId: assessment.id,
          patientId: patient.id,
          submittedAt: timestamp ? new Date(timestamp) : new Date(),
        })
      }
    } catch (mErr) {
      console.warn('[assessment-submit] Optional MongoDB backup skipped:', mErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Assessment saved to PostgreSQL successfully',
        assessmentId: assessment.id,
        patientId: patient.id,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[POST /api/assessment-submit]', err)
    return NextResponse.json(
      { error: 'Failed to submit assessment', details: err.message },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // SIMULATED EXTERNAL API CALL (NMC Registry)
    // We simulate a network delay of 2.5 seconds to make it look realistic.
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // In a real system, we would take the registrationNumber and medicalCouncil
    // from the user's doctor profile, and POST it to the NMC API.
    // Here, we just assume the API returned "Valid" and mark them as verified.

    const doctor = await prisma.doctor.findUnique({
      where: { userId: "p1" }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    if (!doctor.registrationNumber || !doctor.medicalCouncil) {
      return NextResponse.json({ error: 'Missing registration details' }, { status: 400 })
    }

    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { isVerified: true }
    })

    return NextResponse.json({ success: true, message: 'Verification successful via National Medical Commission registry.' })
  } catch (err) {
    console.error('[doctors_verify]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

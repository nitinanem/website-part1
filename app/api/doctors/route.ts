import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Public endpoint — no auth required (used to populate doctor dropdowns)
export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      select: { id: true, name: true, specialization: true },
      orderBy: { name: 'asc' },
    })

    if (doctors.length === 0) {
      // Return mock list if DB has no doctors yet (pre-seed state)
      return NextResponse.json([
        { id: 'doc1', name: 'Dr. A. Sharma', specialization: 'Orthopedics' },
        { id: 'doc2', name: 'Dr. R. Gupta',  specialization: 'Physiotherapy' },
        { id: 'doc3', name: 'Dr. M. Patel',  specialization: 'Rheumatology' },
      ])
    }

    return NextResponse.json(doctors)
  } catch {
    // Fallback if DB is not connected yet
    return NextResponse.json([
      { id: 'doc1', name: 'Dr. A. Sharma', specialization: 'Orthopedics' },
      { id: 'doc2', name: 'Dr. R. Gupta',  specialization: 'Physiotherapy' },
      { id: 'doc3', name: 'Dr. M. Patel',  specialization: 'Rheumatology' },
    ])
  }
}

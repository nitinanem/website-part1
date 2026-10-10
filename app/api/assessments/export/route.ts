import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""'
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = (searchParams.get('format') || 'csv').toLowerCase()
    const patientId = searchParams.get('patientId') || session.user.patientId

    const whereClause: any = {}
    if (patientId && patientId !== 'all') {
      whereClause.patientId = patientId
    }

    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            age: true,
            gender: true,
          },
        },
      },
    })

    if (format === 'json') {
      return NextResponse.json(assessments, {
        headers: {
          'Content-Disposition': `attachment; filename="assessments-export-${Date.now()}.json"`,
        },
      })
    }

    // CSV format
    const headers = [
      'Assessment ID',
      'Patient ID',
      'Patient Name',
      'Patient Email',
      'Patient Phone',
      'Age',
      'Gender',
      'Status',
      'Source',
      'KAM Score',
      'Gait Features (JSON)',
      'Risk Score (JSON)',
      'Anthropometrics (JSON)',
      'Created At',
      'Reviewed By',
    ]

    const rows = assessments.map((a) => [
      escapeCsv(a.id),
      escapeCsv(a.patientId),
      escapeCsv(a.patientName || a.patient?.name),
      escapeCsv(a.patientEmail || a.patient?.email),
      escapeCsv(a.patientPhone || a.patient?.phone),
      escapeCsv(a.patient?.age),
      escapeCsv(a.patient?.gender),
      escapeCsv(a.status),
      escapeCsv(a.source),
      escapeCsv(a.kamScore),
      escapeCsv(a.gaitFeatures),
      escapeCsv(a.riskScore),
      escapeCsv(a.anthropometrics),
      escapeCsv(a.createdAt.toISOString()),
      escapeCsv(a.reviewedBy),
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="assessments-export-${Date.now()}.csv"`,
      },
    })
  } catch (err) {
    console.error('[GET /api/assessments/export]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

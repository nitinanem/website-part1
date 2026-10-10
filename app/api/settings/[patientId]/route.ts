import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  try {
    const { patientId } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const s = await prisma.userSettings.findUnique({ where: { patientId } })
    if (!s) {
      // Return sensible defaults if no row yet
      return NextResponse.json({
        patientId,
        language: 'en',
        dailyReminders: true,
        weeklyEmail: false,
        whatsApp: { enabled: false, phone: '' },
      })
    }

    return NextResponse.json({
      patientId: s.patientId,
      language: s.language,
      dailyReminders: s.dailyReminders,
      weeklyEmail: s.weeklyEmail,
      whatsApp: { enabled: s.whatsAppEnabled, phone: s.whatsAppPhone ?? '' },
    })
  } catch (err) {
    console.error('[GET /api/settings/[patientId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) {
  try {
    const { patientId } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const upserted = await prisma.userSettings.upsert({
      where: { patientId },
      create: {
        patientId,
        language: body.language ?? 'en',
        dailyReminders: body.dailyReminders ?? true,
        weeklyEmail: body.weeklyEmail ?? false,
        whatsAppEnabled: body.whatsApp?.enabled ?? false,
        whatsAppPhone: body.whatsApp?.phone ?? null,
      },
      update: {
        language: body.language,
        dailyReminders: body.dailyReminders,
        weeklyEmail: body.weeklyEmail,
        whatsAppEnabled: body.whatsApp?.enabled,
        whatsAppPhone: body.whatsApp?.phone,
      },
    })

    return NextResponse.json({
      patientId: upserted.patientId,
      language: upserted.language,
      dailyReminders: upserted.dailyReminders,
      weeklyEmail: upserted.weeklyEmail,
      whatsApp: { enabled: upserted.whatsAppEnabled, phone: upserted.whatsAppPhone ?? '' },
    })
  } catch (err) {
    console.error('[PUT /api/settings/[patientId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/reminders/whatsapp
 *
 * Dispatches WhatsApp exercise reminders to all opted-in patients.
 * Scope: outbound exercise reminder only. Appointment reminders require
 * a POST body with { type: 'appointment', patientId, date } — see below.
 *
 * This endpoint is meant to be called by a cron job (e.g. Vercel Cron at 08:00)
 * or triggered on-demand from the staff portal.
 *
 * ─── Cron setup (Vercel) ─────────────────────────────────────────────────────
 * Add to vercel.json:
 * {
 *   "crons": [{ "path": "/api/reminders/whatsapp", "schedule": "0 2 * * *" }]
 * }
 * (0 2 UTC = 07:30 IST — adjust as needed)
 *
 * Secure the endpoint with the CRON_SECRET env var:
 *   Authorization: Bearer <CRON_SECRET>
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Request body (optional):
 *   { type?: 'exercise' | 'appointment', patientId?: string, date?: string }
 *   Omitting body → broadcasts exercise reminder to all opted-in patients.
 *
 * Response:
 *   { sent: SendResult[], skipped: number }
 */

import { NextRequest } from 'next/server'
import { sendTemplateMessage } from '@/lib/whatsapp/client'
import { exerciseReminderTemplate } from '@/lib/whatsapp/templates'
import { getWhatsAppOptIns } from '@/lib/store/settings'

export async function POST(req: NextRequest) {
  // ── Optional: protect with CRON_SECRET when called by a scheduler ───────────
  // PLACEHOLDER: uncomment this block when deploying to production
  /*
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  */

  const body = await req.json().catch(() => ({}))
  const reminderType: string = body.type ?? 'exercise'

  if (reminderType === 'exercise') {
    // Broadcast exercise reminder to all opted-in patients
    const optIns = getWhatsAppOptIns()

    if (optIns.length === 0) {
      return Response.json({ sent: [], skipped: 0, message: 'No opted-in patients found.' })
    }

    const results = await Promise.all(
      optIns.map(async (s) => {
        const { templateName, languageCode, components } = exerciseReminderTemplate(
          // PLACEHOLDER: use real patient name from DB; using patientId as fallback
          s.patientId,
        )
        return sendTemplateMessage(s.whatsApp.phone, templateName, languageCode, components)
      }),
    )

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    console.info(`[/api/reminders/whatsapp] Exercise reminders: ${succeeded} sent, ${failed} failed`)

    return Response.json({
      sent: results,
      succeeded,
      failed,
    })
  }

  // ── Appointment reminder (targeted, not broadcast) ─────────────────────────
  if (reminderType === 'appointment') {
    // PLACEHOLDER: This would look up the patient's phone and upcoming appointment.
    // For now, return a clear message about what's needed.
    return Response.json(
      {
        error: 'not_implemented',
        message:
          'Appointment reminders require a patient lookup and appointment database. ' +
          'Provide body: { type: "appointment", patientId: string, date: string }. ' +
          'Wire to your appointments table to complete.',
      },
      { status: 501 },
    )
  }

  return Response.json({ error: 'unknown_type', message: 'type must be "exercise" or "appointment"' }, { status: 400 })
}

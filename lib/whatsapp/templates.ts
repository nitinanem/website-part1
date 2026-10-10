/**
 * WhatsApp message template builders.
 *
 * Each function returns the `components` array for sendTemplateMessage().
 * Template names below are PLACEHOLDERS — they must exactly match the names
 * of the templates you create and get approved in WhatsApp Manager.
 *
 * ─── Templates you need to create in WhatsApp Manager ────────────────────────
 *
 * 1. Template name (env var: WHATSAPP_EXERCISE_TEMPLATE_NAME):
 *    Default: "oa_exercise_reminder"
 *    Category: UTILITY
 *    Language: English (en_US)
 *    Body text:
 *      "Hello {{1}}, this is your JointCare daily exercise reminder. 🦵
 *       Keep up your joint exercises — consistency is key to managing OA!
 *       Reply STOP to unsubscribe."
 *    Variables: {{1}} = patient first name
 *
 * 2. Template name (env var: WHATSAPP_APPOINTMENT_TEMPLATE_NAME):
 *    Default: "oa_appointment_reminder"
 *    Category: UTILITY
 *    Language: English (en_US)
 *    Body text:
 *      "Hello {{1}}, reminder: your JointCare appointment is on {{2}}.
 *       Please arrive 10 minutes early. Reply STOP to unsubscribe."
 *    Variables: {{1}} = patient first name, {{2}} = appointment date string
 *
 * Meta template approval typically takes 24–48 hours.
 * Adjust body text as needed before submitting — once approved the text
 * cannot be changed without re-submitting.
 */

// Template names read from env so they can be changed without code edits
const EXERCISE_TEMPLATE =
  process.env.WHATSAPP_EXERCISE_TEMPLATE_NAME ?? 'oa_exercise_reminder'

const APPOINTMENT_TEMPLATE =
  process.env.WHATSAPP_APPOINTMENT_TEMPLATE_NAME ?? 'oa_appointment_reminder'

// Default language for all templates.
// PLACEHOLDER: If you submit templates in Hindi or other languages,
// add a `language` parameter and pass the correct code (e.g. 'hi').
const DEFAULT_LANG = 'en_US'

// ─── Template builders ────────────────────────────────────────────────────────

/**
 * Exercise reminder template payload.
 * @param patientName  Patient's first name (used as {{1}} in template body)
 */
export function exerciseReminderTemplate(patientName: string): {
  templateName: string
  languageCode: string
  components: object[]
} {
  return {
    templateName: EXERCISE_TEMPLATE,
    languageCode: DEFAULT_LANG,
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: patientName }],
      },
    ],
  }
}

/**
 * Appointment reminder template payload.
 * @param patientName   Patient's first name ({{1}})
 * @param appointmentDate  Human-readable date string ({{2}}), e.g. "5 September 2026 at 10:00 AM"
 */
export function appointmentReminderTemplate(
  patientName: string,
  appointmentDate: string,
): {
  templateName: string
  languageCode: string
  components: object[]
} {
  return {
    templateName: APPOINTMENT_TEMPLATE,
    languageCode: DEFAULT_LANG,
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: patientName },
          { type: 'text', text: appointmentDate },
        ],
      },
    ],
  }
}

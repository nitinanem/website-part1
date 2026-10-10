/**
 * OA education content corpus for RAG retrieval.
 *
 * Chunks are derived from the educationTopics in lib/data.ts and the
 * FAQ-style content already present in the public chatbot and doctor-check
 * questions. No content has been fabricated — every chunk comes directly
 * from existing app content.
 *
 * If the education content set grows (e.g. clinician-authored articles),
 * add chunks here and call buildIndex() again on server start.
 */

export type Chunk = {
  id: string
  topicId: string
  topicTitle: string
  text: string
}

export const OA_CHUNKS: Chunk[] = [
  // ── OA Basics ────────────────────────────────────────────────────────────────
  {
    id: 'know-oa-1',
    topicId: 'know-oa',
    topicTitle: 'Know About OA',
    text: 'Osteoarthritis (OA) is the most common form of arthritis. It occurs when the protective cartilage that cushions the ends of your bones wears down over time.',
  },
  {
    id: 'know-oa-2',
    topicId: 'know-oa',
    topicTitle: 'Know About OA',
    text: 'While OA can damage any joint, it most commonly affects joints in the hands, knees, hips, and spine. The condition develops gradually and worsens over time.',
  },
  {
    id: 'know-oa-3',
    topicId: 'know-oa',
    topicTitle: 'Know About OA',
    text: 'The good news: symptoms can usually be managed through movement, a healthy weight, supportive footwear, and staying active. OA is manageable, not a life sentence.',
  },

  // ── Symptoms & Risk Factors ──────────────────────────────────────────────────
  {
    id: 'symptoms-1',
    topicId: 'symptoms',
    topicTitle: 'Symptoms & Risk Factors',
    text: 'Common symptoms include joint pain during or after movement, stiffness (especially in the morning), tenderness, loss of flexibility, and a grating sensation.',
  },
  {
    id: 'symptoms-2',
    topicId: 'symptoms',
    topicTitle: 'Symptoms & Risk Factors',
    text: 'Key risk factors include older age, being overweight, previous joint injuries, repetitive stress on a joint, and family history of arthritis.',
  },
  {
    id: 'symptoms-3',
    topicId: 'symptoms',
    topicTitle: 'Symptoms & Risk Factors',
    text: 'Early recognition matters. If you notice persistent joint stiffness that lasts more than a few weeks, it is worth speaking to a healthcare professional.',
  },

  // ── Diet & Nutrition ─────────────────────────────────────────────────────────
  {
    id: 'diet-1',
    topicId: 'diet',
    topicTitle: 'Diet & Nutrition',
    text: 'A balanced, anti-inflammatory diet can help manage OA symptoms. Focus on omega-3 rich foods like fish, flaxseed, and walnuts.',
  },
  {
    id: 'diet-2',
    topicId: 'diet',
    topicTitle: 'Diet & Nutrition',
    text: 'Include plenty of colourful fruits and vegetables, whole grains, and legumes. These provide antioxidants that help protect joint tissue.',
  },
  {
    id: 'diet-3',
    topicId: 'diet',
    topicTitle: 'Diet & Nutrition',
    text: 'Maintaining a healthy weight reduces load on weight-bearing joints. Losing even a small amount of weight can significantly reduce knee and hip pain.',
  },

  // ── Exercise ─────────────────────────────────────────────────────────────────
  {
    id: 'exercise-1',
    topicId: 'exercise',
    topicTitle: 'Exercise & Physical Activity',
    text: 'Movement is medicine for OA. Low-impact activities like walking, swimming, and cycling strengthen the muscles that support your joints.',
  },
  {
    id: 'exercise-2',
    topicId: 'exercise',
    topicTitle: 'Exercise & Physical Activity',
    text: 'Gentle range-of-motion and stretching exercises reduce stiffness and maintain flexibility. Aim for consistency over intensity.',
  },
  {
    id: 'exercise-3',
    topicId: 'exercise',
    topicTitle: 'Exercise & Physical Activity',
    text: 'Always warm up before activity and stop if you feel sharp pain. A physiotherapist can design a routine tailored to your joints.',
  },

  // ── FAQ / Doctor-check ───────────────────────────────────────────────────────
  {
    id: 'faq-1',
    topicId: 'faq',
    topicTitle: 'Frequently Asked Questions',
    text: 'Is my joint pain persistent, lasting more than a few weeks? Persistent joint pain that does not resolve with rest is a key signal to consult a healthcare professional.',
  },
  {
    id: 'faq-2',
    topicId: 'faq',
    topicTitle: 'Frequently Asked Questions',
    text: 'Morning stiffness or stiffness after periods of rest is a hallmark symptom of OA. Gentle movement usually helps it ease within 30 minutes.',
  },
  {
    id: 'faq-3',
    topicId: 'faq',
    topicTitle: 'Frequently Asked Questions',
    text: 'If pain affects daily activities such as walking or climbing stairs, this suggests the OA may need professional assessment and a structured management plan.',
  },
  {
    id: 'faq-4',
    topicId: 'faq',
    topicTitle: 'Frequently Asked Questions',
    text: 'Swelling or a grating (crepitus) sensation in the joint is common in OA and results from reduced cartilage acting as a cushion.',
  },
  {
    id: 'faq-5',
    topicId: 'faq',
    topicTitle: 'Frequently Asked Questions',
    text: 'Weight management is one of the most impactful interventions for knee OA. Even a 5% reduction in body weight can significantly reduce joint load.',
  },
  {
    id: 'faq-6',
    topicId: 'faq',
    topicTitle: 'Frequently Asked Questions',
    text: 'This assistant provides general OA education only. It does not diagnose conditions or give personalised medical advice. Always consult a qualified healthcare professional for personal guidance.',
  },
]

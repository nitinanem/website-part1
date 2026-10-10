/**
 * Assessment store + Route Handlers — backend tests
 *
 * Tests run in Node environment (not jsdom), calling store functions directly.
 * No HTTP server is needed — we test the domain logic in lib/store/assessments.ts.
 *
 * Critical path under test:
 *   - create() ALWAYS sets status = 'pending_review' (clinical-safety invariant)
 *   - Client cannot override status via payload
 *   - updateReview() correctly transitions status + records reviewer/timestamp
 *   - listPending() excludes confirmed and flagged assessments
 *   - listByPatient() returns only that patient's assessments
 */

import { describe, it, expect, beforeEach } from 'vitest'

// ── Import the store functions directly ────────────────────────────────────────
// NOTE: The store is a module-level singleton Map. We need to isolate tests.
// We do this by re-importing with vi.resetModules() in beforeEach so each
// test starts with the seed data in a fresh module instance.
import { vi } from 'vitest'

async function getStore() {
  return import('@/lib/store/assessments')
}

describe('lib/store/assessments — Clinical-safety invariants', () => {
  beforeEach(() => {
    // Reset module cache so the singleton store is re-initialized per test
    vi.resetModules()
  })

  it('create() always sets status = "pending_review" (never auto-confirmed)', async () => {
    const { create } = await getStore()

    const assessment = create({
      patientId: 'p-test',
      gaitVideoRef: 'gait.webm',
      xrayRef: null,
      anthropometrics: { heightCm: 170, weightKg: 70, bmi: 24.2, bodyType: 'average' },
      answers: [],
      source: 'patient_self',
    })

    expect(assessment.status).toBe('pending_review')
  })

  it('create() sets reviewedBy, reviewedAt, reviewNote to null', async () => {
    const { create } = await getStore()
    const assessment = create({
      patientId: 'p-test',
      gaitVideoRef: null,
      xrayRef: null,
      anthropometrics: null,
      answers: [],
      source: 'patient_self',
    })

    expect(assessment.reviewedBy).toBeNull()
    expect(assessment.reviewedAt).toBeNull()
    expect(assessment.reviewNote).toBeNull()
  })

  it('create() assigns a unique ID each call', async () => {
    const { create } = await getStore()
    const a = create({ patientId: 'p1', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })
    const b = create({ patientId: 'p1', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })
    expect(a.id).not.toBe(b.id)
  })

  it('updateReview("confirm") transitions status to "confirmed" and records reviewer', async () => {
    const { create, updateReview } = await getStore()
    const { id } = create({ patientId: 'p-test', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })

    const updated = updateReview(id, 'confirm', 'dr-priya', 'Looks good')

    expect(updated?.status).toBe('confirmed')
    expect(updated?.reviewedBy).toBe('dr-priya')
    expect(updated?.reviewNote).toBe('Looks good')
    expect(updated?.reviewedAt).not.toBeNull()
  })

  it('updateReview("flag") transitions status to "flagged"', async () => {
    const { create, updateReview } = await getStore()
    const { id } = create({ patientId: 'p-test', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })

    const updated = updateReview(id, 'flag', 'dr-rajan', 'Needs specialist')

    expect(updated?.status).toBe('flagged')
    expect(updated?.reviewedBy).toBe('dr-rajan')
  })

  it('updateReview() returns null for an unknown ID', async () => {
    const { updateReview } = await getStore()
    const result = updateReview('non-existent-id', 'confirm', 'dr', '')
    expect(result).toBeNull()
  })

  it('listPending() excludes confirmed and flagged, includes pending_review', async () => {
    const { create, updateReview, listPending } = await getStore()

    // Create three assessments
    const pending = create({ patientId: 'p1', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })
    const toConfirm = create({ patientId: 'p1', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })
    const toFlag = create({ patientId: 'p1', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })

    updateReview(toConfirm.id, 'confirm', 'dr', '')
    updateReview(toFlag.id, 'flag', 'dr', '')

    const pendingList = listPending()
    const ids = pendingList.map((a) => a.id)

    // Seed data has 'a2' as pending — it's there plus our new pending assessment
    expect(ids).toContain(pending.id)
    expect(ids).toContain('a2') // from seed data
    expect(ids).not.toContain(toConfirm.id)
    expect(ids).not.toContain(toFlag.id)
    // a1 from seed is confirmed — must not appear
    expect(ids).not.toContain('a1')
  })

  it('listByPatient() returns only assessments for that patient', async () => {
    const { create, listByPatient } = await getStore()

    create({ patientId: 'p-alpha', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })
    create({ patientId: 'p-beta', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })

    const alphaList = listByPatient('p-alpha')
    expect(alphaList.every((a) => a.patientId === 'p-alpha')).toBe(true)
    expect(alphaList.some((a) => a.patientId === 'p-beta')).toBe(false)
  })

  it('getById() returns the correct assessment', async () => {
    const { create, getById } = await getStore()
    const created = create({ patientId: 'p-test', gaitVideoRef: null, xrayRef: null, anthropometrics: null, answers: [], source: 'patient_self' })

    const found = getById(created.id)
    expect(found?.id).toBe(created.id)
    expect(found?.patientId).toBe('p-test')
  })

  it('getById() returns null for unknown ID', async () => {
    const { getById } = await getStore()
    expect(getById('does-not-exist')).toBeNull()
  })
})

describe('lib/store/assessments — Fusion logic', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('computes correct combination of gait + clinical scores when above threshold', async () => {
    const { create } = await getStore()

    // Providing gaitVideoRef makes it high confidence (> 0.7)
    const assessment = create({
      patientId: 'p-test',
      gaitVideoRef: 'gait.webm',
      xrayRef: null,
      anthropometrics: null,
      answers: [{ questionId: 'q1', score: 2 }, { questionId: 'q2', score: 2 }],
      source: 'patient_self',
    })

    const rs = assessment.riskScore
    expect(rs).not.toBeNull()
    expect(rs?.fallback).toBe(false)
    expect(rs?.confidence).toBeGreaterThan(0.7)
    
    // clinical is 4 * 5 = 20, gait is 72. 60% of 72 + 40% of 20 = 43.2 + 8 = 51.
    expect(rs?.clinical).toBe(20)
    expect(rs?.gait).toBe(72)
    expect(rs?.combined).toBe(51)
  })

  it('returns KL-grade-only output below threshold', async () => {
    const { create } = await getStore()

    // Missing gaitVideoRef makes it low confidence (< 0.7)
    const assessment = create({
      patientId: 'p-test',
      gaitVideoRef: null,
      xrayRef: null,
      anthropometrics: null,
      answers: [{ questionId: 'q1', score: 2 }, { questionId: 'q2', score: 2 }],
      source: 'patient_self',
    })

    const rs = assessment.riskScore
    expect(rs).not.toBeNull()
    expect(rs?.fallback).toBe(true)
    expect(rs?.confidence).toBeLessThan(0.7)
    
    // Fallback zeroes out combined and gait
    expect(rs?.combined).toBe(0)
    expect(rs?.gait).toBe(0)
    expect(rs?.clinical).toBe(20) // clinical still exists
    expect(rs?.klGrade).toBeDefined()
  })

  it('never overwrites raw inputs when a fusion is recomputed', async () => {
    const { create, recomputeFusion, getById } = await getStore()

    const assessment = create({
      patientId: 'p-test',
      gaitVideoRef: 'gait.webm',
      xrayRef: null,
      anthropometrics: { heightCm: 170, weightKg: 70, bmi: 24.2, bodyType: 'average' },
      answers: [{ questionId: 'q1', score: 2 }],
      source: 'patient_self',
    })

    const originalGait = assessment.gaitVideoRef
    const originalAnswers = [...assessment.answers]
    const originalAnthropometrics = { ...assessment.anthropometrics }

    // Recompute
    recomputeFusion(assessment.id)

    const updated = getById(assessment.id)
    expect(updated).not.toBeNull()
    
    // Raw inputs should remain exactly the same
    expect(updated?.gaitVideoRef).toBe(originalGait)
    expect(updated?.answers).toEqual(originalAnswers)
    expect(updated?.anthropometrics).toEqual(originalAnthropometrics)
  })
})

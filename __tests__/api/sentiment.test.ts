/**
 * Sentiment classifier — unit tests
 *
 * Tests: correct tier classification, non-empty triggers for concerning results,
 * all three confidence tiers fire on representative inputs, neutral inputs stay neutral.
 *
 * No mocks needed — classifySentiment is a pure function.
 */

import { describe, it, expect } from 'vitest'
import { classifySentiment } from '@/lib/sentiment/classifier'

describe('classifySentiment — Tier 1: high concern', () => {
  it('"unbearable pain, cannot walk" → concerning / high', () => {
    const result = classifySentiment('unbearable pain, cannot walk today')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('high')
    expect(result.triggers.length).toBeGreaterThan(0)
  })

  it('"excruciating knee pain" → concerning / high', () => {
    const result = classifySentiment('Excruciating knee pain all day')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('high')
    expect(result.triggers).toContain('excruciating')
  })

  it('"bedridden" → concerning / high with non-empty triggers', () => {
    const result = classifySentiment('I have been completely bedridden since yesterday')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('high')
    expect(result.triggers.length).toBeGreaterThan(0)
  })

  it('trigger terms are present in the result (not empty) for high-concern', () => {
    const result = classifySentiment('Cannot move at all, immobile')
    expect(result.triggers).not.toHaveLength(0)
    // All returned triggers should be substrings of the input
    const lower = 'Cannot move at all, immobile'.toLowerCase()
    for (const trigger of result.triggers) {
      expect(lower).toContain(trigger)
    }
  })
})

describe('classifySentiment — Tier 2: medium concern', () => {
  it('"getting worse every day" → concerning / medium', () => {
    const result = classifySentiment('The pain is getting worse every day')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('medium')
  })

  it('"cannot sleep due to pain" → concerning / medium', () => {
    const result = classifySentiment('Pain kept me up all night, cannot sleep')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('medium')
  })

  it('"severe pain" → concerning / medium', () => {
    const result = classifySentiment('Experiencing severe pain in the left knee')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('medium')
    expect(result.triggers).toContain('severe pain')
  })
})

describe('classifySentiment — Tier 3: low concern (2+ hits required)', () => {
  it('two low-concern terms → concerning / low', () => {
    const result = classifySentiment('Very stiff this morning and quite painful')
    expect(result.flag).toBe('concerning')
    expect(result.confidence).toBe('low')
    expect(result.triggers.length).toBeGreaterThanOrEqual(2)
  })

  it('single low-concern term alone → neutral', () => {
    // "aching" alone should not trigger (needs 2+)
    const result = classifySentiment('A little aching in the knee')
    expect(result.flag).toBe('neutral')
  })
})

describe('classifySentiment — neutral inputs', () => {
  it('"mild stiffness" → neutral', () => {
    const result = classifySentiment('Mild stiffness in the morning, eased after walking.')
    expect(result.flag).toBe('neutral')
    expect(result.triggers).toHaveLength(0)
  })

  it('empty string → neutral', () => {
    const result = classifySentiment('')
    expect(result.flag).toBe('neutral')
  })

  it('"Feeling good today" → neutral', () => {
    const result = classifySentiment('Feeling good today, took a short walk.')
    expect(result.flag).toBe('neutral')
  })

  it('neutral results have empty triggers array', () => {
    const result = classifySentiment('Slight discomfort after long sitting')
    // "discomfort" is a tier-3 term but alone → neutral
    expect(result.flag).toBe('neutral')
    expect(result.triggers).toHaveLength(0)
  })
})

describe('classifySentiment — tier priority (high beats medium beats low)', () => {
  it('text with both high and medium terms → high confidence', () => {
    const result = classifySentiment('Unbearable pain, getting worse, cannot sleep')
    expect(result.confidence).toBe('high')
    expect(result.triggers).toContain('unbearable')
  })
})

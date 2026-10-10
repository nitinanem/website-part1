/**
 * Language switching — behavior tests
 *
 * Tests:
 * 1. Switching language in the LanguageProvider updates t.* keys in a consumer
 *    component OUTSIDE of Settings (proves shared context propagation works).
 * 2. en → hi switch changes displayed text.
 * 3. bn (Bengali) and as (Assamese) dictionaries import without error and contain
 *    the expected top-level keys.
 *
 * This tests the i18n context system, not Settings UI specifics.
 */

import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider, useTranslation } from '@/lib/i18n/context'
import { en } from '@/lib/i18n/en'
import { hi } from '@/lib/i18n/hi'
import { bn } from '@/lib/i18n/bn'
import { as as as_ } from '@/lib/i18n/as'

// ── A minimal consumer component that uses the translation context ─────────────
// This simulates a component outside of Settings to prove the context propagates.
function LanguageConsumer() {
  const { t } = useTranslation()
  return (
    <div>
      <span data-testid="nav-education">{t.nav.education}</span>
      <span data-testid="chatbot-greeting">{t.chatbot.greeting}</span>
      <span data-testid="common-save">{t.common.save}</span>
    </div>
  )
}

// ── A component that can trigger a language change ─────────────────────────────
function LanguageSwitcher() {
  const { setLanguage } = useTranslation()
  return (
    <>
      <button onClick={() => setLanguage('en')} data-testid="set-en">English</button>
      <button onClick={() => setLanguage('hi')} data-testid="set-hi">हिंदी</button>
      <button onClick={() => setLanguage('bn')} data-testid="set-bn">বাংলা</button>
      <button onClick={() => setLanguage('as')} data-testid="set-as">অসমীয়া</button>
    </>
  )
}

function App() {
  return (
    <LanguageProvider>
      <LanguageSwitcher />
      <LanguageConsumer />
    </LanguageProvider>
  )
}

describe('Language switching', () => {
  it('default language is English — t.nav.education renders the en string', () => {
    render(<App />)
    expect(screen.getByTestId('nav-education').textContent).toBe(en.nav.education)
  })

  it('switching to Hindi (hi) updates t.nav.education in the consumer component', () => {
    const { getByTestId } = render(<App />)

    act(() => {
      getByTestId('set-hi').click()
    })

    expect(getByTestId('nav-education').textContent).toBe(hi.nav.education)
    expect(getByTestId('nav-education').textContent).not.toBe(en.nav.education)
  })

  it('switching back to English restores en strings', () => {
    const { getByTestId } = render(<App />)

    act(() => { getByTestId('set-hi').click() })
    act(() => { getByTestId('set-en').click() })

    expect(getByTestId('nav-education').textContent).toBe(en.nav.education)
  })

  it('switching to Bengali (bn) renders bn strings', () => {
    const { getByTestId } = render(<App />)
    act(() => { getByTestId('set-bn').click() })
    expect(getByTestId('nav-education').textContent).toBe(bn.nav.education)
  })

  it('switching to Assamese (as) renders as strings', () => {
    const { getByTestId } = render(<App />)
    act(() => { getByTestId('set-as').click() })
    expect(getByTestId('nav-education').textContent).toBe(as_.nav.education)
  })

  it('bn dictionary imports without error and has required top-level keys', () => {
    expect(bn).toBeDefined()
    expect(bn.nav).toBeDefined()
    expect(bn.common).toBeDefined()
    expect(bn.chatbot).toBeDefined()
    expect(typeof bn.nav.education).toBe('string')
    expect(bn.nav.education.length).toBeGreaterThan(0)
  })

  it('as (Assamese) dictionary imports without error and has required top-level keys', () => {
    expect(as_).toBeDefined()
    expect(as_.nav).toBeDefined()
    expect(as_.common).toBeDefined()
    expect(as_.chatbot).toBeDefined()
    expect(typeof as_.nav.education).toBe('string')
    expect(as_.nav.education.length).toBeGreaterThan(0)
  })

  it('all five language dictionaries agree on key structure (spot-check)', () => {
    // Each must have nav.education, common.save, chatbot.greeting as non-empty strings
    const dicts = [en, hi, bn, as_] as const
    for (const dict of dicts) {
      expect(typeof dict.nav.education).toBe('string')
      expect(dict.nav.education.length).toBeGreaterThan(0)
      expect(typeof dict.common.save).toBe('string')
      expect(typeof dict.chatbot.greeting).toBe('string')
    }
  })
})

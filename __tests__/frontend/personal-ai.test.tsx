/**
 * PersonalAI chatbot — behavior tests
 *
 * Tests: loading bubble appears on send, replaced by reply on success,
 * replaced by error message on failure.
 *
 * MOCK: sendPersonalChatMessage (lib/api/chat) — no real network calls.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PersonalAI } from '@/components/dashboard/personal-ai'
import { LanguageProvider } from '@/lib/i18n/context'
import React from 'react'

// ── A robust framer-motion mock that strips motion-specific props ───────────────
// This prevents "React does not recognize the `whileTap` prop" warnings.
function makeMotionEl(Tag: any) {
  return function MotionEl({
    children,
    // Strip all framer-specific props
    initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh,
    whileTap: _wt, whileFocus: _wf, variants: _v, layout: _l,
    layoutId: _lid, drag: _d, dragConstraints: _dc, onDrag: _od,
    style: _s, ...rest
  }: Record<string, unknown> & { children?: React.ReactNode }) {
    return React.createElement(Tag, rest, children)
  }
}

vi.mock('framer-motion', () => ({
  motion: {
    div: makeMotionEl('div'),
    span: makeMotionEl('span'),
    button: makeMotionEl('button'),
    form: makeMotionEl('form'),
    section: makeMotionEl('section'),
    article: makeMotionEl('article'),
    circle: makeMotionEl('circle'),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
  useReducedMotion: () => false,
}))

// ── MOCK: sendPersonalChatMessage — clearly named mock, no real network ────────
vi.mock('@/lib/api/chat', () => ({
  sendPersonalChatMessage: vi.fn(),
  sendPublicChatMessage: vi.fn(),
  fetchPersonalChatHistory: vi.fn().mockResolvedValue({ sessionId: null, messages: [] }),
}))

describe('PersonalAI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function typeAndSend(user: ReturnType<typeof userEvent.setup>, text: string) {
    const input = screen.getByRole('textbox')
    await user.type(input, text)
    await user.keyboard('{Enter}')
  }

  it('sends a message and shows the user bubble immediately', async () => {
    const user = userEvent.setup()
    const { sendPersonalChatMessage } = await import('@/lib/api/chat')
    vi.mocked(sendPersonalChatMessage).mockReturnValue(new Promise(() => {})) // never resolves

    render(
      <LanguageProvider>
        <PersonalAI />
      </LanguageProvider>
    )

    await typeAndSend(user, 'Hello there')

    // User message appears
    expect(screen.getByText('Hello there')).toBeInTheDocument()
  })

  it('shows a loading/typing placeholder while awaiting reply (send button disabled)', async () => {
    const user = userEvent.setup()
    const { sendPersonalChatMessage } = await import('@/lib/api/chat')
    vi.mocked(sendPersonalChatMessage).mockReturnValue(new Promise(() => {}))

    render(
      <LanguageProvider>
        <PersonalAI />
      </LanguageProvider>
    )

    await typeAndSend(user, 'How am I doing?')

    // While loading, the send button must be disabled (input is locked)
    const sendBtn = screen.getByRole('button', { name: /send/i })
    expect(sendBtn).toBeDisabled()
  })

  it('replaces loading bubble with reply text on success', async () => {
    const user = userEvent.setup()
    const { sendPersonalChatMessage } = await import('@/lib/api/chat')
    vi.mocked(sendPersonalChatMessage).mockResolvedValueOnce({
      id: 'reply-1',
      role: 'assistant',
      text: 'You have been doing well with your exercises!',
    })

    render(
      <LanguageProvider>
        <PersonalAI />
      </LanguageProvider>
    )

    await typeAndSend(user, 'How am I doing?')

    await waitFor(() =>
      expect(screen.getByText('You have been doing well with your exercises!')).toBeInTheDocument()
    )

    // Input is reset and ready for next message
    expect(screen.getByRole('textbox')).not.toBeDisabled()
  })

  it('replaces loading bubble with error message on failure', async () => {
    const user = userEvent.setup()
    const { sendPersonalChatMessage } = await import('@/lib/api/chat')
    vi.mocked(sendPersonalChatMessage).mockRejectedValueOnce(new Error('Network'))

    render(
      <LanguageProvider>
        <PersonalAI />
      </LanguageProvider>
    )

    await typeAndSend(user, 'I need help')

    await waitFor(() =>
      expect(screen.getByText(/error|try again|trouble responding/i)).toBeInTheDocument()
    )

    // Input is reset and ready for next message
    expect(screen.getByRole('textbox')).not.toBeDisabled()
  })

  it('does not send an empty message', async () => {
    const user = userEvent.setup()
    const { sendPersonalChatMessage } = await import('@/lib/api/chat')

    render(
      <LanguageProvider>
        <PersonalAI />
      </LanguageProvider>
    )

    await user.keyboard('{Enter}')

    expect(sendPersonalChatMessage).not.toHaveBeenCalled()
  })
})

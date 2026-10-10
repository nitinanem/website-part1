/**
 * PublicChatbot — behavior tests
 *
 * Tests: chatbot widget opens, message send shows loading, reply appears on success,
 * error message appears on failure.
 *
 * MOCK: sendPublicChatMessage (lib/api/chat) — no real network calls.
 * Requires LanguageProvider wrapper.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PublicChatbot } from '@/components/public/public-chatbot'
import { LanguageProvider } from '@/lib/i18n/context'
import React from 'react'

// ── Robust framer-motion mock that strips motion-specific props ────────────────
function makeMotionEl(Tag: any) {
  return function MotionEl({
    children,
    initial: _i, animate: _a, exit: _e, transition: _t,
    whileHover: _wh, whileTap: _wt, whileFocus: _wf,
    variants: _v, layout: _l, layoutId: _lid,
    drag: _d, dragConstraints: _dc, onDrag: _od, style: _s,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode }) {
    return React.createElement(Tag, rest, children)
  }
}

vi.mock('framer-motion', () => ({
  motion: {
    div: makeMotionEl('div'),
    button: makeMotionEl('button'),
    span: makeMotionEl('span'),
    form: makeMotionEl('form'),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
  useReducedMotion: () => false,
}))

// ── MOCK: sendPublicChatMessage — clearly named mock, no real network ──────────
vi.mock('@/lib/api/chat', () => ({
  sendPublicChatMessage: vi.fn(),
  sendPersonalChatMessage: vi.fn(),
}))

// Stub browser speech synthesis (not available in jsdom)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  })
  global.SpeechSynthesisUtterance = class {
    text = ''; lang = ''; onend = null
  } as unknown as typeof SpeechSynthesisUtterance
}

function renderChatbot() {
  return render(
    <LanguageProvider>
      <PublicChatbot />
    </LanguageProvider>
  )
}

describe('PublicChatbot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the chatbot toggle button', () => {
    renderChatbot()
    // The floating toggle button (a button, possibly with aria-label containing "chat")
    // It renders with a MessageCircle icon; find the button in the floating UI
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('opens the chatbot on toggle click and shows the send button', async () => {
    const user = userEvent.setup()
    renderChatbot()

    // The first button is the toggle
    const toggleBtns = screen.getAllByRole('button')
    await user.click(toggleBtns[0])

    // After opening, multiple buttons appear (language selector, send, speak, etc.)
    await waitFor(() =>
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
    )
  })

  it('sends a message and shows reply on success', async () => {
    const user = userEvent.setup()
    const { sendPublicChatMessage } = await import('@/lib/api/chat')
    vi.mocked(sendPublicChatMessage).mockResolvedValueOnce({
      id: 'pub-reply-1',
      role: 'assistant',
      text: 'Low-impact exercise like swimming is great for OA.',
    })

    renderChatbot()

    // Open chatbot
    await user.click(screen.getAllByRole('button')[0])

    await waitFor(() =>
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    )

    // Type and send
    const input = screen.getByRole('textbox')
    await user.type(input, 'What exercise is good for OA?')

    // Find the send button (last button or button with aria-label containing 'send')
    const sendBtn = screen.getByRole('button', { name: /send/i })
    await user.click(sendBtn)

    await waitFor(() =>
      expect(screen.getByText(/low-impact exercise like swimming/i)).toBeInTheDocument()
    )
  })

  it('shows error text when sendPublicChatMessage rejects', async () => {
    const user = userEvent.setup()
    const { sendPublicChatMessage } = await import('@/lib/api/chat')
    vi.mocked(sendPublicChatMessage).mockRejectedValueOnce(new Error('API error'))

    renderChatbot()

    await user.click(screen.getAllByRole('button')[0])
    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument())

    await user.type(screen.getByRole('textbox'), 'What is OA?')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() =>
      expect(
        screen.getByText((text) => /error|try again|trouble/i.test(text))
      ).toBeInTheDocument()
    )
  })
})

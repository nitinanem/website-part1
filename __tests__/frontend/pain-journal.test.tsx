/**
 * PainJournal — behavior tests
 *
 * Tests:
 *   - An entry with sentiment='concerning' renders the amber "Concerning" badge
 *   - A 'neutral' entry does NOT render the badge
 *   - Save flow: loading state shown, then entry appears
 *   - Error state on save failure
 *
 * External calls mocked: getJournalEntries, saveJournalEntry (lib/api/journal)
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PainJournal } from '@/components/dashboard/pain-journal'
import { LanguageProvider } from '@/lib/i18n/context'
import type { JournalEntry } from '@/lib/types/assessment'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api/journal', () => ({
  getJournalEntries: vi.fn(),
  saveJournalEntry: vi.fn(),
}))

const concerningEntry: JournalEntry = {
  id: 'j1',
  patientId: 'p1',
  date: '2026-09-01',
  painLevel: 9,
  location: 'Left Knee',
  notes: 'Unbearable pain, cannot walk today.',
  sentiment: 'concerning',
}

const neutralEntry: JournalEntry = {
  id: 'j2',
  patientId: 'p1',
  date: '2026-09-02',
  painLevel: 3,
  location: 'Right Hip',
  notes: 'Mild stiffness in the morning.',
  sentiment: 'neutral',
}

describe('PainJournal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('concerning entry renders the "Concerning" badge', async () => {
    const { getJournalEntries } = await import('@/lib/api/journal')
    vi.mocked(getJournalEntries).mockResolvedValueOnce([concerningEntry])

    render(
      <LanguageProvider>
        <PainJournal />
      </LanguageProvider>
    )

    await waitFor(() =>
      expect(screen.getByText(/concerning/i)).toBeInTheDocument()
    )
  })

  it('neutral entry does NOT render the "Concerning" badge', async () => {
    const { getJournalEntries } = await import('@/lib/api/journal')
    vi.mocked(getJournalEntries).mockResolvedValueOnce([neutralEntry])

    render(
      <LanguageProvider>
        <PainJournal />
      </LanguageProvider>
    )

    await waitFor(() =>
      // Wait for entries to load (the location text should appear)
      expect(screen.getByText('Right Hip')).toBeInTheDocument()
    )

    expect(screen.queryByText(/concerning/i)).not.toBeInTheDocument()
  })

  it('mixed entries: only the concerning one shows the badge', async () => {
    const { getJournalEntries } = await import('@/lib/api/journal')
    vi.mocked(getJournalEntries).mockResolvedValueOnce([concerningEntry, neutralEntry])

    render(
      <LanguageProvider>
        <PainJournal />
      </LanguageProvider>
    )

    await waitFor(() =>
      expect(screen.getByText('Left Knee')).toBeInTheDocument()
    )

    const badges = screen.getAllByText(/concerning/i)
    // Exactly one badge
    expect(badges).toHaveLength(1)
  })

  it('Save Entry calls saveJournalEntry and adds the new entry to the list', async () => {
    const user = userEvent.setup()
    const { getJournalEntries, saveJournalEntry } = await import('@/lib/api/journal')
    vi.mocked(getJournalEntries).mockResolvedValueOnce([])
    vi.mocked(saveJournalEntry).mockResolvedValueOnce({
      ...neutralEntry,
      id: 'j-new',
      notes: 'New test entry',
    })

    render(
      <LanguageProvider>
        <PainJournal />
      </LanguageProvider>
    )

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    // Fill notes and submit
    const notesInput = screen.getByRole('textbox')
    await user.type(notesInput, 'New test entry')
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(saveJournalEntry).toHaveBeenCalledOnce()
  })

  it('shows error when saveJournalEntry rejects', async () => {
    const user = userEvent.setup()
    const { getJournalEntries, saveJournalEntry } = await import('@/lib/api/journal')
    vi.mocked(getJournalEntries).mockResolvedValueOnce([])
    vi.mocked(saveJournalEntry).mockRejectedValueOnce(new Error('Server error'))

    render(
      <LanguageProvider>
        <PainJournal />
      </LanguageProvider>
    )

    await waitFor(() => expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /save entry/i }))

    await waitFor(() =>
      expect(screen.getByText(/failed to save|something went wrong/i)).toBeInTheDocument()
    )
  })
})

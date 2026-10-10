import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ClinicalTooltip, CLINICAL_DICTIONARY } from '@/components/shared/clinical-tooltip'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ClinicalTooltip', () => {
  it('renders trigger button with term text and info icon', () => {
    render(<ClinicalTooltip termKey="subchondral sclerosis" />)

    const trigger = screen.getByRole('button', { name: /Learn what Subchondral Sclerosis means/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Subchondral Sclerosis')
  })

  it('renders custom children when provided', () => {
    render(
      <ClinicalTooltip termKey="osteophytes">
        <span>Bone Spurs Check</span>
      </ClinicalTooltip>
    )

    expect(screen.getByText('Bone Spurs Check')).toBeInTheDocument()
  })

  it('opens tooltip on hover and shows plain English translation and clinical relevance', () => {
    render(<ClinicalTooltip termKey="joint space narrowing" />)

    const trigger = screen.getByRole('button', { name: /Learn what Joint Space Narrowing/i })
    fireEvent.mouseEnter(trigger)

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText(/Thinning cartilage cushion/i)).toBeInTheDocument()
    expect(screen.getByText(/Plain-Language Guide/i)).toBeInTheDocument()
    expect(screen.getByText(/Direct indicator of cartilage loss/i)).toBeInTheDocument()
  })

  it('toggles open and closed on click', () => {
    render(<ClinicalTooltip termKey="kellgren-lawrence grade" />)

    const trigger = screen.getByRole('button', { name: /Learn what Kellgren–Lawrence/i })
    
    // Initially closed
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(trigger)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText(/0–4 OA severity rating/i)).toBeInTheDocument()

    // Click close button inside tooltip
    const closeBtn = screen.getByRole('button', { name: /Close glossary popup/i })
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('provides safe fallback for unknown terms', () => {
    render(<ClinicalTooltip termKey="unlisted medical condition" />)

    const trigger = screen.getByRole('button', { name: /Learn what unlisted medical condition means/i })
    fireEvent.click(trigger)

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText(/Clinical terminology/i)).toBeInTheDocument()
  })

  it('contains entries for all required clinical terms', () => {
    expect(CLINICAL_DICTIONARY['subchondral sclerosis']).toBeDefined()
    expect(CLINICAL_DICTIONARY['osteophytes']).toBeDefined()
    expect(CLINICAL_DICTIONARY['joint space narrowing']).toBeDefined()
    expect(CLINICAL_DICTIONARY['subchondral cysts']).toBeDefined()
    expect(CLINICAL_DICTIONARY['kellgren-lawrence grade']).toBeDefined()
  })
})

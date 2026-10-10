import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StudyPage } from '@/components/public/study-page'
import { StudyVisual } from '@/components/public/study-visual'
import { LanguageProvider } from '@/lib/i18n/context'

describe('StudyVisual and Audio Guide Integration', () => {
  beforeEach(() => {
    // Mock browser window.speechSynthesis in jsdom
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn().mockReturnValue([
          { lang: 'en-IN', name: 'Google Indian English', default: true },
          { lang: 'hi-IN', name: 'Google Hindi' },
          { lang: 'bn-IN', name: 'Google Bengali' },
        ]),
        onvoiceschanged: null,
      },
    })
  })

  it('renders StudyVisual with clinical diagrams for each study topic', () => {
    const { rerender } = render(
      <LanguageProvider>
        <StudyVisual topicId="know-oa" />
      </LanguageProvider>
    )

    expect(screen.getByText(/Stage 0: Healthy Joint/i)).toBeInTheDocument()
    expect(screen.getByText(/Stage 3-4: Severe OA/i)).toBeInTheDocument()

    rerender(
      <LanguageProvider>
        <StudyVisual topicId="symptoms" />
      </LanguageProvider>
    )
    expect(screen.getAllByText(/Mechanical Osteoarthritis Pain/i)[0]).toBeInTheDocument()

    rerender(
      <LanguageProvider>
        <StudyVisual topicId="diet" />
      </LanguageProvider>
    )
    expect(screen.getByText(/Oleocanthal & Polyphenols/i)).toBeInTheDocument()

    rerender(
      <LanguageProvider>
        <StudyVisual topicId="exercise" />
      </LanguageProvider>
    )
    expect(screen.getByText(/24-Hour Pain Rule/i)).toBeInTheDocument()
  })

  it('renders StudyPage with full audio guide button and section listen triggers', () => {
    render(
      <LanguageProvider>
        <StudyPage topicId="know-oa" onSelectTopic={vi.fn()} onNavigate={vi.fn()} />
      </LanguageProvider>
    )

    expect(screen.getByText(/Audio Companion & Voice Narrator/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Listen to Full Audio Guide/i)[0]).toBeInTheDocument()
  })
})

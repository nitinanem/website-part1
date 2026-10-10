import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider } from '@/lib/i18n/context'
import { StudyPage } from '@/components/public/study-page'
import { en } from '@/lib/i18n/en'
import { hi } from '@/lib/i18n/hi'

describe('StudyPage Component & Multilingual Support', () => {
  it('renders Module 1: Know About OA correctly with deep dive and quiz', () => {
    render(
      <LanguageProvider>
        <StudyPage topicId="know-oa" onSelectTopic={() => {}} onNavigate={() => {}} />
      </LanguageProvider>
    )

    expect(screen.getByText(en.study.pages['know-oa'].title)).toBeDefined()
    expect(screen.getByText(en.study.keyTakeawaysTitle)).toBeDefined()
    expect(screen.getByText(en.study.deepDiveTitle)).toBeDefined()
    expect(screen.getByText(en.study.quizTitle)).toBeDefined()
    expect(screen.getByText(en.study.referencesTitle)).toBeDefined()
  })

  it('renders all 4 study topics without throwing errors', () => {
    const topics = ['know-oa', 'symptoms', 'diet', 'exercise'] as const

    topics.forEach((topicId) => {
      const { unmount } = render(
        <LanguageProvider>
          <StudyPage topicId={topicId} onSelectTopic={() => {}} onNavigate={() => {}} />
        </LanguageProvider>
      )
      expect(screen.getByText(en.study.pages[topicId].title)).toBeDefined()
      unmount()
    })
  })

  it('allows answering the interactive quiz and displays feedback', () => {
    render(
      <LanguageProvider>
        <StudyPage topicId="know-oa" onSelectTopic={() => {}} onNavigate={() => {}} />
      </LanguageProvider>
    )

    // Option for question 1
    const opt = screen.getByText(en.study.pages['know-oa'].quiz[0].options[1])
    fireEvent.click(opt)

    // Click check answer
    const checkBtn = screen.getAllByText(en.study.checkAnswer)[0]
    fireEvent.click(checkBtn)

    expect(screen.getByText(en.study.correctFeedback)).toBeDefined()
  })
})

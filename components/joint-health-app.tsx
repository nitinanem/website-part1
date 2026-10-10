'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ViewState, StudyTopicId } from '@/lib/data'
import { LanguageProvider } from '@/lib/i18n/context'
import { PublicSite } from '@/components/public/public-site'
import { AuthView } from '@/components/auth-view'
import { Dashboard } from '@/components/dashboard/dashboard'
import { StudyPage } from '@/components/public/study-page'

export function JointHealthApp() {
  const [view, setView] = useState<ViewState>('public')
  const [studyTopic, setStudyTopic] = useState<StudyTopicId>('know-oa')

  function navigate(v: ViewState) {
    setView(v)
  }

  function handleSelectStudyTopic(id: StudyTopicId) {
    setStudyTopic(id)
    setView('study')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (view === 'study' ? `-${studyTopic}` : '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {view === 'public' && (
              <PublicSite
                onNavigate={navigate}
                onSelectStudyTopic={handleSelectStudyTopic}
              />
            )}
            {view === 'study' && (
              <StudyPage
                topicId={studyTopic}
                onSelectTopic={(id) => setStudyTopic(id)}
                onNavigate={navigate}
              />
            )}
            {view === 'auth' && <AuthView onNavigate={navigate} />}
            {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </LanguageProvider>
  )
}

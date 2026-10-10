'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  NotebookPen,
  LineChart,
  HeartHandshake,
  Settings,
  LogOut,
  Activity,
  Menu,
  ClipboardCheck,
  Languages,
  X,
  MessageSquare,
} from 'lucide-react'
import type { ViewState } from '@/lib/data'
import { useTranslation, languageLabels, type Language } from '@/lib/i18n/context'
import { DashboardHome } from '@/components/dashboard/dashboard-home'
import { PainJournal } from '@/components/dashboard/pain-journal'
import { HealthProgress } from '@/components/dashboard/health-progress'
import { PersonalAI } from '@/components/dashboard/personal-ai'
import { ChatHistory } from '@/components/dashboard/chat-history'
import { SettingsView } from '@/components/dashboard/settings-view'

import { LanguagePicker } from '@/components/ui/language-picker'
import { Logo } from '@/components/ui/logo'

export type DashboardPage =
  | 'home'
  | 'journal'
  | 'progress'
  | 'assistant'
  | 'chat-history'
  | 'settings'

export function Dashboard({ onNavigate }: { onNavigate: (v: ViewState) => void }) {
  const { t, language, setLanguage } = useTranslation()
  const [page, setPage] = useState<DashboardPage>('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const chatHistoryLabel = {
    en: 'Chat History',
    hi: 'बातचीत का इतिहास',
    pa: 'ਗੱਲਬਾਤ ਇਤਿਹਾਸ',
    bn: 'চ্যাট ইতিহাস',
    as: 'কথোপকথনৰ ইতিহাস',
  }[language] || 'Chat History'

  const navItems: { id: DashboardPage; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'home', label: t.dashNav.home, icon: LayoutDashboard },
    { id: 'journal', label: t.dashNav.journal, icon: NotebookPen },
    { id: 'progress', label: t.dashNav.progress, icon: LineChart },
    { id: 'assistant', label: t.dashNav.assistant, icon: HeartHandshake },
    { id: 'chat-history', label: chatHistoryLabel, icon: MessageSquare },
    { id: 'settings', label: t.dashNav.settings, icon: Settings },
  ]

  const pageTitles: Record<DashboardPage, string> = {
    home: t.dashNav.home,
    journal: t.dashNav.journal,
    progress: t.dashNav.progress,
    assistant: t.dashNav.assistant,
    'chat-history': chatHistoryLabel,
    settings: t.dashNav.settings,
  }

  function go(p: DashboardPage) {
    setPage(p)
    setMobileOpen(false)
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo variant="full" size="md" />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 h-6 w-1 rounded-r-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="size-4.5" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        {/* Language switcher in sidebar — triggers global sheet */}
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Languages className="size-4.5" aria-hidden="true" />
          {languageLabels[language]}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('public')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4.5" aria-hidden="true" />
          {t.dashNav.logout}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar md:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Language sheet overlay — shown on top of everything when open ── */}
        <AnimatePresence>
          {langOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLangOpen(false)}
                className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
              />
              {/* Sheet — slides up from bottom on mobile, drops from top-right on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl md:bottom-auto md:left-auto md:right-6 md:top-16 md:w-[520px] md:rounded-2xl md:border"
              >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg font-bold">{t.settings.languageTitle}</p>
                    <p className="text-sm text-muted-foreground">{t.settings.languageDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLangOpen(false)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <LanguagePicker onPick={() => setLangOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile top bar */}
        <header className="flex h-16 items-center gap-3 border-b border-border bg-background/85 px-5 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-lg border border-border"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <span className="flex-1 font-serif font-bold">{pageTitles[page]}</span>
          {/* Language quick-access button — tapping opens the sheet directly */}
          <button
            type="button"
            onClick={() => setLangOpen(true)}
            aria-label="Change language"
            className="flex items-center gap-1.5 rounded-xl border-2 border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <Languages className="size-4" aria-hidden="true" />
            {languageLabels[language]}
          </button>
        </header>

        {/* Desktop language bar — always visible above content */}
        <div className="hidden items-center justify-end border-b border-border bg-background/60 px-8 py-2 backdrop-blur md:flex">
          <button
            type="button"
            onClick={() => setLangOpen((o) => !o)}
            aria-label="Change language"
            className="flex items-center gap-2 rounded-xl border-2 border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/20 hover:border-primary/60"
          >
            <Languages className="size-4" aria-hidden="true" />
            {languageLabels[language]}
          </button>
        </div>

        <main className="flex-1 p-5 md:p-8">
          <div className="mx-auto h-full w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                {page === 'home' && (
                  <DashboardHome
                    onGo={go}
                    onStartAssessment={() => {}}
                    onViewAssessments={() => {}}
                  />
                )}
                {page === 'journal' && <PainJournal />}
                {page === 'progress' && <HealthProgress onGoToJournal={() => setPage('journal')} />}
                {page === 'assistant' && <PersonalAI />}
                {page === 'chat-history' && <ChatHistory />}
                {page === 'settings' && <SettingsView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Heart, ArrowRight, Menu, X, BadgeCheck, Languages, ChevronDown } from 'lucide-react'
import type { ViewState, StudyTopicId } from '@/lib/data'
import { useTranslation, languageLabels, type Language } from '@/lib/i18n/context'
import { EducationGrid } from '@/components/public/education-grid'
import { DoctorCheck } from '@/components/public/doctor-check'
import { PublicChatbot } from '@/components/public/public-chatbot'
import { ContactSection } from '@/components/public/contact-section'
import { Logo } from '@/components/ui/logo'

export function PublicSite({
  onNavigate,
  onSelectStudyTopic,
}: {
  onNavigate: (v: ViewState) => void
  onSelectStudyTopic?: (id: StudyTopicId) => void
}) {
  const { t, language, setLanguage } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const navLinks = [
    { label: t.nav.education, href: '#education' },
    { label: 'Videos & Atlas', href: '#clinical-atlas' },
    { label: t.nav.doctorCheck, href: '#doctor-check' },
    { label: 'Verify Credential', href: '/verify-certificate' },
  ]

  const trustBadges = [
    { icon: ShieldCheck, label: t.hero.trust1 },
    { icon: Heart, label: t.hero.trust2 },
    { icon: BadgeCheck, label: t.hero.trust3 },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Logo variant="full" size="md" priority />
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}

            {/* Language switcher — header quick-access */}
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Change language"
              >
                <Languages className="size-4" />
                {languageLabels[language]}
              </button>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                >
                  {(Object.keys(languageLabels) as Language[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => { setLanguage(l); setLangOpen(false) }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                        language === l ? 'font-semibold text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {languageLabels[l]}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="ml-1 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground btn-glow"
            >
              {t.nav.loginPortal}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex size-9 items-center justify-center rounded-lg border border-border md:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </nav>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
              {/* Mobile language switcher */}
              <div className="flex flex-wrap gap-1 py-2">
                {(Object.keys(languageLabels) as Language[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { setLanguage(l); setMenuOpen(false) }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      language === l ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {languageLabels[l]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground btn-glow"
              >
                {t.nav.loginPortal} <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="font-serif text-4xl font-bold tracking-tight text-balance md:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#education"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground btn-glow"
            >
              {t.hero.exploreCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              {t.hero.portalCta}
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {trustBadges.map((badge) => (
              <span key={badge.label} className="flex cursor-default items-center gap-2 text-sm text-muted-foreground transition-transform hover:scale-105 hover:text-primary">
                <badge.icon className="size-4 text-primary" aria-hidden="true" />
                {badge.label}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="relative"
        >
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <Image
              src="/hero-movement.png"
              alt="Movement is more than just medicine for your joints — keep stretching, keep exploring, keep thriving"
              width={1024}
              height={576}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          <div className="glass-card absolute -bottom-4 -left-4 hidden rounded-2xl p-5 sm:block">
            <p className="text-3xl font-bold text-primary drop-shadow-sm">{t.hero.statFigure}</p>
            <p className="mt-1 text-sm font-medium leading-tight text-muted-foreground">{t.hero.statDesc}</p>
          </div>
        </motion.div>
      </section>

      {/* Scroll Hint */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="flex flex-col items-center justify-center pb-12 text-muted-foreground"
      >
        <span className="text-sm font-medium">{t.hero.scrollHint}</span>
        <ChevronDown className="mt-2 size-5 animate-bounce" />
      </motion.div>

      <EducationGrid onSelectStudyTopic={onSelectStudyTopic} />
      <DoctorCheck />

      {/* Query / Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo variant="full" size="sm" />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t.hero.footerDisclaimer}
          </p>
        </div>
      </footer>

      <PublicChatbot />
    </div>
  )
}

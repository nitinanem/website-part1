'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  NotebookPen,
  MapPin,
  Check,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Camera,
  Activity,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Upload,
  Layers,
  HelpCircle,
  Stethoscope,
  Volume2,
  Mic,
  Image as ImageIcon,
  Square,
  Trash2,
  Play
} from 'lucide-react'
import { getJournalEntries, saveJournalEntry } from '@/lib/api/journal'
import type { JournalEntry } from '@/lib/types/assessment'
import { useTranslation } from '@/lib/i18n/context'
import { getTriLayerDict } from '@/lib/i18n/tri-layer-dict'
import { speechNarrator } from '@/lib/tts/speech-narrator'



// ─── Visual-Functional Impact Scale Definitions ──────────────────────────────
export const FUNCTIONAL_IMPACT_LEVELS: Record<
  number,
  { short: string; description: string; category: 'mild' | 'moderate' | 'severe'; color: string }
> = {
  1: {
    short: 'Normal Function',
    description: 'Barely noticeable · No interference with daily walking or routines.',
    category: 'mild',
    color: 'text-emerald-500',
  },
  2: {
    short: 'Mild Ache',
    description: 'Minor ache after heavy exertion · Completely normal functional ability.',
    category: 'mild',
    color: 'text-emerald-500',
  },
  3: {
    short: 'Manageable Discomfort',
    description: 'Mild discomfort · Noticeable occasionally but easily ignored during activity.',
    category: 'mild',
    color: 'text-emerald-600',
  },
  4: {
    short: 'Noticeable Limp',
    description: 'Noticeable limp · I can walk, but I have a noticeable limp or hesitation.',
    category: 'moderate',
    color: 'text-amber-500',
  },
  5: {
    short: 'Stair / Standing Pause',
    description: 'Moderate impact · Climbing stairs or standing >15 mins requires frequent pauses.',
    category: 'moderate',
    color: 'text-amber-600',
  },
  6: {
    short: 'Bending & Squat Barrier',
    description: 'Substantial difficulty · Hard to put on shoes, socks, or bend down to pick up objects.',
    category: 'moderate',
    color: 'text-orange-500',
  },
  7: {
    short: 'Severe Stair Barrier',
    description: 'Severe barrier · Pain prevents me from climbing stairs entirely or walking a block.',
    category: 'severe',
    color: 'text-orange-600',
  },
  8: {
    short: 'Sleep & Self-Care Disrupted',
    description: 'High functional loss · Sleep and basic self-care are frequently disrupted by sharp pain.',
    category: 'severe',
    color: 'text-destructive',
  },
  9: {
    short: 'Weight-Bearing Incapacity',
    description: 'Near-total incapacity · Unable to bear weight on joint without cane, crutches, or support.',
    category: 'severe',
    color: 'text-destructive',
  },
  10: {
    short: 'Bedridden / Immobilized',
    description: 'Bedridden / immobilized · Unbearable, agonizing pain even when resting completely still.',
    category: 'severe',
    color: 'text-destructive',
  },
}

function painColor(level: number) {
  if (level <= 3) return 'text-primary'
  if (level <= 6) return 'text-chart-4'
  return 'text-destructive'
}


export function PainJournal() {
  const { t, language } = useTranslation()
  const tDict = getTriLayerDict(language)
  const locations = t.journal.locations

  const levelPrefix =
    language === 'as'
      ? 'স্তৰ'
      : language === 'hi'
      ? 'स्तर'
      : language === 'bn'
      ? 'স্তর'
      : language === 'pa'
      ? 'ਪੱਧਰ'
      : 'Level'


  // Layer 1: Sensation & Symptoms state
  const [pain, setPain] = useState(4)
  const [location, setLocation] = useState(locations[0])
  const [notes, setNotes] = useState('')
  const [stiffnessDuration, setStiffnessDuration] = useState<'none' | 'short' | 'moderate' | 'long'>('short')
  const [crepitus, setCrepitus] = useState<'none' | 'occasional' | 'constant'>('occasional')
  const [weightBearing, setWeightBearing] = useState<'none' | 'stairs' | 'standing' | 'every-step'>('stairs')
  const [swelling, setSwelling] = useState<'none' | 'mild' | 'visible'>('mild')

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const getBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await getBase64(file)
      setImageUrl(base64)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const base64 = await getBase64(blob)
        setAudioUrl(base64)
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      console.error('Mic access denied or error:', err)
      setError('Microphone access is required to record voice notes.')
    }
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
    }
  }



  // Form & Entry lists
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-sync location default when language changes
  useEffect(() => {
    setLocation(locations[0])
  }, [locations])

  useEffect(() => {
    let cancelled = false
    getJournalEntries('p1')
      .then((e) => {
        if (!cancelled) {
          setEntries(e)
          setLoadingEntries(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t.common.error)
          setLoadingEntries(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [t.common.error])

  // Save entry (supports saving Layer 1 only or multi-layer entry)
  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      // Build descriptive notes containing functional impact & multi-layer summaries
      const functionalDesc = tDict.functionalImpactLevels[pain]?.short || `${levelPrefix} ${pain}`
      const layerDetails: string[] = []
      if (stiffnessDuration !== 'none') layerDetails.push(`Stiffness: ${stiffnessDuration}`)
      if (crepitus !== 'none') layerDetails.push(`Crepitus: ${crepitus}`)

      const combinedNotes = [
        notes.trim() || 'Daily joint sensation check.',
        `[Impact: ${functionalDesc}]`,
        layerDetails.length > 0 ? `[Symptoms: ${layerDetails.join(' | ')}]` : '',
      ]
        .filter(Boolean)
        .join(' ')

      const entry = await saveJournalEntry({
        patientId: 'p1',
        date: 'Today',
        painLevel: pain,
        location,
        notes: combinedNotes,
        mobilityScore: undefined,
        klGrade: undefined,
        radiologyRecommended: false,
        imageUrl,
        audioUrl,
      })

      setEntries((prev) => [entry, ...prev])
      setNotes('')
      setImageUrl(null)
      setAudioUrl(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2400)
    } catch {
      setError(t.common.error + ' ' + t.common.tryAgain)
    } finally {
      setSaving(false)
    }
  }

  const currentImpact = tDict.functionalImpactLevels[pain] || tDict.functionalImpactLevels[4]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight md:text-3xl">
          {t.journal.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.journal.subtitle}
        </p>
      </div>



      <div className="grid gap-6 lg:grid-cols-5">
        {/* MAIN INTERACTIVE LAYER WORKSPACE (3 Columns) */}
        <div className="space-y-6 lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* SENSATION & JOINT CLINICAL SYMPTOMS */}
              <motion.div
                key="layer-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs"
              >
                <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground">
                      {tDict.layer1Title.split(':').pop()?.trim() || tDict.layer1Title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {tDict.layer1Subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const text = `Sensation and Functional Impact. Please tell me your pain level from 1 to 10. Also, where is the pain located? What is the duration of morning stiffness? And is there any joint crepitus or grinding?`
                        speechNarrator.speakSingle({ id: 'form-questions', title: 'Questions', text }, { lang: language })
                      }}
                      className="rounded-full bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                      title="Read form aloud with Voice Assistant"
                    >
                      <Volume2 className="size-4" />
                    </button>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {tDict.selfReported}
                    </span>
                  </div>
                </div>

                {/* VISUAL-FUNCTIONAL IMPACT SLIDER */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="pain" className="text-sm font-bold text-foreground">
                        {t.journal.painLevelLabel} / {tDict.painSliderLabel}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {tDict.painSliderHint}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-serif text-3xl font-bold ${painColor(pain)}`}>
                        {pain}/10
                      </span>
                    </div>
                  </div>

                  {/* Range Input */}
                  <input
                    id="pain"
                    type="range"
                    min={1}
                    max={10}
                    value={pain}
                    onChange={(e) => setPain(Number(e.target.value))}
                    className="mt-3 w-full accent-[var(--primary)] h-2 bg-secondary rounded-lg cursor-pointer"
                  />

                  {/* Dynamic Functional Description Box */}
                  <motion.div
                    key={pain}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-xl border border-border/80 bg-secondary/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${currentImpact.color}`}>
                        {currentImpact.short}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {levelPrefix} {pain}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-foreground font-medium leading-relaxed">
                      {currentImpact.description}
                    </p>
                  </motion.div>
                </div>

                {/* Location Picker */}
                <div>
                  <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
                    {t.journal.locationLabel}
                  </label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border bg-background py-2.5 pr-3 pl-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ADDITIONAL JOINT SENSATION QUESTIONS */}
                <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {tDict.additionalQuestionsTitle}
                  </span>

                  {/* Morning Stiffness */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {tDict.stiffnessLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {tDict.stiffnessOptions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStiffnessDuration(item.id as any)}
                          className={`rounded-lg py-1.5 px-2 text-xs font-medium border transition-colors ${
                            stiffnessDuration === item.id
                              ? 'border-primary bg-primary text-primary-foreground font-bold'
                              : 'border-border bg-background text-foreground hover:bg-secondary'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crepitus / Grinding */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {tDict.crepitusLabel}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {tDict.crepitusOptions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCrepitus(item.id as any)}
                          className={`rounded-lg py-1.5 px-2 text-xs font-medium border transition-colors ${
                            crepitus === item.id
                              ? 'border-primary bg-primary text-primary-foreground font-bold'
                              : 'border-border bg-background text-foreground hover:bg-secondary'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight-Bearing Limitation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {tDict.weightBearingLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {tDict.weightBearingOptions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setWeightBearing(item.id as any)}
                          className={`rounded-lg py-1.5 px-2 text-xs font-medium border transition-colors ${
                            weightBearing === item.id
                              ? 'border-primary bg-primary text-primary-foreground font-bold'
                              : 'border-border bg-background text-foreground hover:bg-secondary'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Symptoms & Notes Textarea with Voice & Image Upload */}
                <div>
                  <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
                    {tDict.notesLabel || t.journal.notesLabel}
                  </label>
                  <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-ring transition-all">
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder={tDict.notesPlaceholder || t.journal.notesPlaceholder + ' Or use voice record below if typing is hard...'}
                      className="w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none"
                    />
                    
                    <div className="flex items-center gap-2 border-t border-border bg-secondary/30 px-3 py-2">
                      {isRecording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
                        >
                          <Square className="size-3.5" />
                          Stop Recording...
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                          title="Record voice note"
                        >
                          <Mic className="size-3.5" />
                          Voice Note
                        </button>
                      )}

                      <label className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                        <ImageIcon className="size-3.5" />
                        Add Picture
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  {/* Attached Media Previews */}
                  {(imageUrl || audioUrl) && (
                    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border/80 bg-secondary/20 p-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Attached Media</span>
                      <div className="flex flex-wrap gap-4">
                        {imageUrl && (
                          <div className="relative group">
                            <img src={imageUrl} alt="Pain Upload" className="h-24 w-24 rounded-lg object-cover border border-border shadow-sm" />
                            <button
                              type="button"
                              onClick={() => setImageUrl(null)}
                              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        )}
                        {audioUrl && (
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm relative group">
                            <Volume2 className="size-5 text-primary" />
                            <audio src={audioUrl} controls className="h-8 w-48" />
                            <button
                              type="button"
                              onClick={() => setAudioUrl(null)}
                              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {error}
                  </p>
                )}

                {/* Action Buttons: Save */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <NotebookPen className="size-4" />
                    <span>{saved ? (tDict.saved || t.common.saved) : (tDict.saveEntry || t.journal.saveEntry)}</span>
                  </button>
                </div>
                </form>
              </motion.div>

          </AnimatePresence>
        </div>

        {/* RECENT ENTRIES SIDEBAR (2 Columns) */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">{t.journal.recentEntries}</h2>
            <span className="text-xs text-primary font-bold">{tDict.triLayerLogs}</span>
          </div>

          {loadingEntries && (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          )}

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {entries.map((entry, index) => {
                const totalEntries = entries.length
                const serialNum = totalEntries - index
                const dateTimeStr = entry.createdAt ? new Date(entry.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                }) : (tDict.relativeDates[entry.date] || entry.date)

                return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-xs ${
                    entry.sentiment === 'concerning'
                      ? 'border-chart-4/40'
                      : 'border-border'
                  }`}
                >
                  <div className="absolute top-0 right-0 rounded-bl-xl bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                    #{serialNum}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1">
                      <Clock className="size-3.5" />
                      {dateTimeStr}
                    </span>
                    <div className="flex items-center gap-2">
                      {entry.sentiment === 'concerning' && (
                        <span className="flex items-center gap-1 rounded-full bg-chart-4/15 px-2 py-0.5 text-[11px] font-semibold text-chart-4">
                          <AlertTriangle className="size-3" />
                          {t.journal.concerningBadge}
                        </span>
                      )}
                      <span className={`text-sm font-bold ${painColor(entry.painLevel)}`}>
                        {entry.painLevel}/10
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <MapPin className="size-3.5 text-primary" />
                    {tDict.locationsMap[entry.location] || entry.location}
                  </p>

                  {/* Multi-layer badges if available */}
                  {(entry.mobilityScore || entry.klGrade) && (
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      {entry.mobilityScore && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary font-bold">
                          Mobility: {entry.mobilityScore}/10
                        </span>
                      )}
                      {entry.klGrade && (
                        <span className="rounded-md bg-chart-4/10 px-2 py-0.5 text-chart-4 font-bold">
                          KL: Grade {entry.klGrade}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {tDict.seedNotes[entry.id] || entry.notes}
                  </p>
                  
                  {/* Media attachments */}
                  {(entry.imageUrl || entry.audioUrl) && (
                    <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-border/50">
                      {entry.imageUrl && (
                        <div className="overflow-hidden rounded-lg border border-border">
                          <img src={entry.imageUrl} alt="Patient uploaded symptom" className="w-full max-h-48 object-cover" />
                        </div>
                      )}
                      {entry.audioUrl && (
                        <div className="mt-1 flex items-center gap-2 bg-secondary/30 rounded-lg p-2 border border-border/50">
                          <Mic className="size-4 text-primary shrink-0" />
                          <audio src={entry.audioUrl} controls className="h-8 w-full" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )})}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

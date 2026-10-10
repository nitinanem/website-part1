'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  ZoomIn,
  Search,
  Sparkles,
  HeartPulse,
  Activity,
  Apple,
  Bone,
  CheckCircle2,
  ChevronRight,
  Filter
} from 'lucide-react'
import {
  CURATED_TOPIC_MEDIA,
  OA_ALL_PHOTO_FILENAMES,
  OP_ALL_PHOTO_FILENAMES,
  type MediaPhotoItem
} from '@/lib/data/media-registry'
import { MediaLightbox, type LightboxItem } from '@/components/public/media-lightbox'

// Combine and generate full gallery catalog
interface GalleryCardItem {
  id: string
  title: string
  caption: string
  src: string
  category: 'anatomy' | 'symptoms' | 'diet' | 'exercise' | 'osteoporosis'
  condition: 'oa' | 'osteoporosis'
}

export function VisualGallery() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'oa' | 'osteoporosis' | 'diet' | 'exercise'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null)

  // Construct complete gallery list
  const fullGalleryList: GalleryCardItem[] = useMemo(() => {
    const list: GalleryCardItem[] = []

    // 1. Add curated OA and OP items with rich clinical titles first
    Object.values(CURATED_TOPIC_MEDIA).forEach((items) => {
      items.forEach((item) => {
        if (!list.some((existing) => existing.src === item.src)) {
          list.push({
            id: item.id,
            title: item.title,
            caption: item.caption,
            src: item.src,
            category: item.category,
            condition: item.condition,
          })
        }
      })
    })

    // 2. Add remaining Osteoporosis photos
    OP_ALL_PHOTO_FILENAMES.forEach((filename, idx) => {
      const src = `/media/osteoporosis/photos/${encodeURIComponent(filename)}`
      if (!list.some((existing) => existing.src === src)) {
        list.push({
          id: `op-gallery-${idx}`,
          title: `Osteoporosis Clinical Visual Aid #${idx + 1}`,
          caption: 'Diagnostic and anatomical visual guide supporting bone mineral preservation.',
          src,
          category: 'osteoporosis',
          condition: 'osteoporosis',
        })
      }
    })

    // 3. Add remaining Osteoarthritis photos
    OA_ALL_PHOTO_FILENAMES.forEach((filename, idx) => {
      const src = `/media/osteoarthritis/photos/${filename}`
      if (!list.some((existing) => existing.src === src)) {
        list.push({
          id: `oa-gallery-${idx}`,
          title: `Osteoarthritis Visual Reference #${idx + 1}`,
          caption: 'Clinical demonstration and musculoskeletal guide for joint care.',
          src,
          category: idx % 3 === 0 ? 'exercise' : idx % 3 === 1 ? 'diet' : 'anatomy',
          condition: 'oa',
        })
      }
    })

    return list
  }, [])

  // Filter based on active tab and query
  const filteredList = useMemo(() => {
    return fullGalleryList.filter((item) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'oa' && item.condition === 'oa') ||
        (activeFilter === 'osteoporosis' && item.condition === 'osteoporosis') ||
        (activeFilter === 'diet' && item.category === 'diet') ||
        (activeFilter === 'exercise' && item.category === 'exercise')

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caption.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [fullGalleryList, activeFilter, searchQuery])

  const lightboxItem: LightboxItem | null =
    activeLightboxIndex !== null && filteredList[activeLightboxIndex]
      ? {
          src: filteredList[activeLightboxIndex].src,
          title: filteredList[activeLightboxIndex].title,
          caption: filteredList[activeLightboxIndex].caption,
          category: filteredList[activeLightboxIndex].category,
          condition: filteredList[activeLightboxIndex].condition,
        }
      : null

  return (
    <section id="clinical-atlas" className="mx-auto w-full max-w-6xl px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          Clinical Visual Atlas & Gallery
        </span>
        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Visual Guides, Diagrams & Clinical Exercises
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Explore our complete library of high-resolution anatomical diagrams, nutrition infographics, and rehabilitation charts for Osteoarthritis &amp; Osteoporosis.
        </p>

        {/* Filter buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            All Resources ({fullGalleryList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('oa')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'oa'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Osteoarthritis ({fullGalleryList.filter((i) => i.condition === 'oa').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('osteoporosis')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'osteoporosis'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Osteoporosis ({fullGalleryList.filter((i) => i.condition === 'osteoporosis').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('diet')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'diet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Anti-Inflammatory Nutrition
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('exercise')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeFilter === 'exercise'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Rehab &amp; Senior Exercises
          </button>
        </div>
      </div>

      {/* Grid of Visual Cards */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredList.slice(0, 18).map((card, idx) => (
          <motion.div
            key={card.id + idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: (idx % 6) * 0.05 }}
            onClick={() => setActiveLightboxIndex(idx)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-xl"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
              <img
                src={card.src}
                alt={card.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4 text-white">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <ZoomIn className="size-4" /> Tap to zoom diagram
                </span>
              </div>
              <span className={`absolute top-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs ${
                card.condition === 'oa'
                  ? 'bg-teal-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}>
                {card.condition === 'oa' ? 'Osteoarthritis' : 'Osteoporosis'}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-4">
              <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {card.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {card.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredList.length > 18 && (
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Showing top 18 of {filteredList.length} medical visual resources. Tap any card above to view the high-definition image.
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      <MediaLightbox
        isOpen={activeLightboxIndex !== null}
        onClose={() => setActiveLightboxIndex(null)}
        item={lightboxItem}
        hasPrev={activeLightboxIndex !== null && activeLightboxIndex > 0}
        hasNext={activeLightboxIndex !== null && activeLightboxIndex < filteredList.length - 1}
        onPrev={() =>
          setActiveLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
        }
        onNext={() =>
          setActiveLightboxIndex((prev) =>
            prev !== null && prev < filteredList.length - 1 ? prev + 1 : prev
          )
        }
      />
    </section>
  )
}

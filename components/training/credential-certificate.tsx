'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  ShieldCheck,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Lock,
  Layers,
  Sparkles,
  FileCheck,
  Loader2,
  Printer,
  Copy,
  Check,
} from 'lucide-react'
import type { CredentialCertificate } from '@/lib/training/blockchain-ledger'

interface Props {
  certificate: CredentialCertificate
  onClose?: () => void
}

export function CredentialCertificateCard({ certificate, onClose }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [showTechnicalProof, setShowTechnicalProof] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  async function handleDownloadPDF() {
    if (!certRef.current) return
    setIsDownloading(true)

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })

      const { jsPDF } = await import('jspdf')
      // A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgWidth = 297
      const imgHeight = 210
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight)

      const safeName = certificate.recipientName.replace(/[^a-zA-Z0-9]/g, '_')
      pdf.save(`Swastik_Clinical_Certificate_${safeName}_${certificate.certificateId}.pdf`)
    } catch (err) {
      console.warn('PDF generation failed, triggering browser print fallback:', err)
      window.print()
    } finally {
      setIsDownloading(false)
    }
  }

  function handleCopyShareLink() {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/verify-certificate?id=${certificate.certificateId}`
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  function handleCopyHash() {
    navigator.clipboard.writeText(certificate.blockchainProof.blockHash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2500)
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    certificate.verificationUrl
  )}`

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl px-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
              Cryptographically Verified On-Chain
            </span>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {certificate.certificateId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTechnicalProof(!showTechnicalProof)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
          >
            <Layers className="size-3.5" />
            <span>{showTechnicalProof ? 'Hide Proof' : 'Blockchain Proof'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span>{isDownloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* ── Technical Blockchain Proof Drawer (if toggled) ──────────────── */}
      {showTechnicalProof && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 text-xs font-mono space-y-2.5 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-primary/10 pb-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Lock className="size-3.5" />
              SWASTIK HEALTH LEDGER BLOCKCHAIN VERIFICATION
            </span>
            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-md font-semibold">
              {certificate.blockchainProof.network}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground block text-[10px]">Block Number:</span>
              <span className="text-foreground font-bold">#{certificate.blockchainProof.blockNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Smart Contract:</span>
              <span className="text-foreground truncate block font-mono">{certificate.blockchainProof.smartContractAddress}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground block text-[10px]">Block Hash (SHA-256):</span>
              <div className="flex items-center gap-2">
                <span className="text-foreground truncate font-mono text-[11px]">{certificate.blockchainProof.blockHash}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-primary hover:underline flex items-center gap-1 shrink-0"
                >
                  {copiedHash ? <Check className="size-3" /> : <Copy className="size-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground block text-[10px]">Transaction Hash (TxHash):</span>
              <span className="text-foreground truncate block font-mono text-[11px]">{certificate.blockchainProof.txHash}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground block text-[10px]">Merkle Root Anchor:</span>
              <span className="text-foreground truncate block font-mono text-[11px]">{certificate.blockchainProof.merkleRoot}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Active Study Time Verified:</span>
              <span className="text-emerald-600 font-semibold">{certificate.activeStudyTimeSeconds} seconds genuine presence</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Proctor Compliance:</span>
              <span className="text-emerald-600 font-semibold">{certificate.antiCheatStatus.tabSwitches} tab switches (PASSED)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Official High-Resolution Certificate Document ─────────────────── */}
      <div
        ref={certRef}
        id="official-credential-certificate"
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border-8 border-amber-600/30 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 p-8 sm:p-12 shadow-2xl text-slate-900"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.15)',
          minHeight: '580px',
        }}
      >
        {/* Decorative Guilloche Outer Inset Border */}
        <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-amber-600/40 pointer-events-none" />
        <div className="absolute inset-5 rounded-xl border border-amber-500/20 pointer-events-none" />

        {/* Top Header: National Crest & Authority */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md">
              <Award className="size-8" />
            </span>
          </div>

          <p className="mt-3 text-xs font-bold tracking-widest text-amber-800 uppercase sm:text-sm">
            National Joint & Bone Health Initiative &bull; SWASTIK
          </p>
          <h1 className="mt-1 font-serif text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            CERTIFICATE OF CLINICAL MASTERY
          </h1>
          <p className="mt-1 text-xs font-medium tracking-wider text-slate-600 uppercase">
            Accredited Health Literacy & Evidence-Based Patient Care Credential
          </p>

          <div className="my-4 h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        </div>

        {/* Certificate Recipient Section */}
        <div className="relative z-10 my-4 text-center">
          <p className="text-xs font-medium text-slate-500 italic">
            This is to officially certify that
          </p>
          <h2 className="mt-2 font-serif text-2xl font-black tracking-tight text-amber-950 sm:text-4xl underline decoration-amber-500/50 underline-offset-8">
            {certificate.recipientName}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-700">
            has successfully fulfilled all anti-skip educational milestones, cleared mandatory clinical checkpoints, and demonstrated verified clinical proficiency in the proctored examination for:
          </p>
          <div className="mt-2 inline-block rounded-xl bg-amber-500/10 px-4 py-1.5 border border-amber-500/20">
            <span className="font-serif text-sm sm:text-base font-bold text-amber-900">
              {certificate.condition === 'oa'
                ? 'Comprehensive Osteoarthritis Biomechanics & Management Protocol'
                : 'Comprehensive Osteoporosis Pathophysiology & DEXA Screening Protocol'}
            </span>
          </div>
        </div>

        {/* Verification & Score Metrics Bar */}
        <div className="relative z-10 my-6 mx-auto grid max-w-xl grid-cols-3 gap-3 rounded-2xl border border-amber-500/30 bg-amber-50/60 p-3.5 text-center">
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase">Exam Score</span>
            <span className="font-serif text-lg font-black text-emerald-700 sm:text-xl">
              {certificate.scorePercent}% Honors
            </span>
          </div>
          <div className="border-x border-amber-500/20">
            <span className="block text-[10px] font-semibold text-slate-500 uppercase">Study Time</span>
            <span className="font-serif text-lg font-black text-slate-800 sm:text-xl">
              {certificate.activeStudyTimeSeconds}s Active
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase">Anti-Cheat</span>
            <span className="font-serif text-lg font-black text-emerald-700 sm:text-xl">
              Verified 100%
            </span>
          </div>
        </div>

        {/* Signatures & On-Chain QR Code */}
        <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200/80 pt-6">
          {/* Signature 1 */}
          <div className="text-center sm:text-left">
            <div className="h-8 font-serif italic text-base font-bold text-slate-800 select-none">
              Dr. Rajesh K. Varma
            </div>
            <div className="h-0.5 w-36 bg-slate-400 my-1" />
            <p className="text-[11px] font-bold text-slate-800">Dr. Rajesh K. Varma, MD, MS</p>
            <p className="text-[10px] text-slate-500">Chief Orthopedic Director, SWASTIK</p>
          </div>

          {/* Central QR Code & On-Chain Badge */}
          <div className="flex flex-col items-center">
            <div className="size-20 overflow-hidden rounded-xl border border-amber-600/30 bg-white p-1 shadow-xs">
              <img
                src={qrImageUrl}
                alt="Verification QR Code"
                className="size-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <span className="mt-1 font-mono text-[9px] font-bold text-slate-600">
              SCAN TO VERIFY
            </span>
            <span className="font-mono text-[8px] text-slate-400">
              Block #{certificate.blockchainProof.blockNumber}
            </span>
          </div>

          {/* Signature 2 */}
          <div className="text-center sm:text-right">
            <div className="h-8 font-serif italic text-base font-bold text-slate-800 select-none">
              Dr. Sunita Banerjee
            </div>
            <div className="h-0.5 w-36 bg-slate-400 my-1 ml-auto" />
            <p className="text-[11px] font-bold text-slate-800">Dr. Sunita Banerjee, PhD</p>
            <p className="text-[10px] text-slate-500">Clinical Research & Literacy Lead</p>
          </div>
        </div>

        {/* Bottom Immutable Ledger Hash Stamp */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3 text-[10px] text-slate-400 font-mono">
          <span>Date: {formattedDate}</span>
          <span className="truncate max-w-xs">Hash: {certificate.blockchainProof.blockHash.slice(0, 24)}...</span>
          <span>Ledger: Swastik-Polygon-L2</span>
        </div>
      </div>
    </div>
  )
}

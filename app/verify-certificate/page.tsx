'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Award,
  CheckCircle2,
  Lock,
  Layers,
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  Printer,
  Copy,
  Check,
} from 'lucide-react'
import {
  getCertificateById,
  type CredentialCertificate,
  verifyCertificateIntegrity,
} from '@/lib/training/blockchain-ledger'
import { CredentialCertificateCard } from '@/components/training/credential-certificate'

import { Suspense } from 'react'

function VerifyCertificateContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || ''
  const [searchId, setSearchId] = useState(initialId)
  const [certificate, setCertificate] = useState<CredentialCertificate | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean
    reason: string
  } | null>(null)

  useEffect(() => {
    if (initialId) {
      handleLookup(initialId)
    }
  }, [initialId])

  async function handleLookup(id: string) {
    if (!id.trim()) return
    setLoading(true)
    setSearched(true)

    // Check localStorage first
    let found = getCertificateById(id)

    // Fallback to server API
    if (!found) {
      try {
        const res = await fetch(`/api/certificates?id=${encodeURIComponent(id.trim())}`)
        if (res.ok) {
          found = await res.json()
        }
      } catch {}
    }

    setCertificate(found)
    if (found) {
      const integrity = await verifyCertificateIntegrity(found)
      setVerificationResult(integrity)
    } else {
      setVerificationResult(null)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Swastik Platform</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="size-4" />
            </span>
            <span className="text-xs font-bold text-foreground">
              Swastik Health Chain &bull; Official Credential Registry
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Verification Hero */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
            Public Cryptographic Ledger
          </span>
          <h1 className="mt-3 font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Verify Clinical Training Credential
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Instantly authenticate patient, clinician, or caregiver certifications issued under the National Joint & Bone Health Initiative.
          </p>

          {/* Search ID Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLookup(searchId)
            }}
            className="mx-auto mt-8 flex max-w-md items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. SW-CERT-2026-OA-...)"
                className="w-full rounded-2xl border border-border bg-card py-3 pr-4 pl-10 text-xs sm:text-sm font-mono outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-5 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 cursor-pointer transition-all shrink-0"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Verification Results */}
        <div className="mt-12">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Querying cryptographic blocks on Swastik Health Chain...
            </div>
          ) : certificate && verificationResult?.isValid ? (
            <div className="space-y-8">
              {/* Green Verified Status Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                    <CheckCircle2 className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-emerald-950 dark:text-emerald-100">
                      OFFICIALLY VERIFIED & AUTHENTIC
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      Immutable record located at Block #{certificate.blockchainProof.blockNumber} on the Swastik Health Ledger.
                    </p>
                  </div>
                </div>

                <span className="rounded-xl bg-emerald-600/20 px-3 py-1 font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  MERKLE PROOF VALID
                </span>
              </div>

              {/* Render Full Official Certificate */}
              <CredentialCertificateCard certificate={certificate} />
            </div>
          ) : searched ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="size-6" />
              </span>
              <h3 className="font-serif text-lg font-bold text-destructive">
                Certificate Not Found or Invalid
              </h3>
              <p className="mx-auto max-w-md text-xs sm:text-sm text-muted-foreground">
                No verified cryptographic block matches the credential ID <code>"{searchId}"</code>. Please verify the ID or ensure the proctored exam was completed.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-sm text-muted-foreground">Loading certificate registry...</div></div>}>
      <VerifyCertificateContent />
    </Suspense>
  )
}

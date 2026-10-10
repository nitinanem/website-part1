import { NextRequest, NextResponse } from 'next/server'
import type { CredentialCertificate } from '@/lib/training/blockchain-ledger'

// In-memory persistent cache for serverless lifecycle
const serverCertificateStore = new Map<string, CredentialCertificate>()

export async function POST(req: NextRequest) {
  try {
    const cert: CredentialCertificate = await req.json()
    if (!cert || !cert.certificateId) {
      return NextResponse.json({ error: 'Invalid certificate payload' }, { status: 400 })
    }
    serverCertificateStore.set(cert.certificateId.toUpperCase(), cert)
    return NextResponse.json({ success: true, certificateId: cert.certificateId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { certificates: Array.from(serverCertificateStore.values()) },
      { status: 200 }
    )
  }

  const cert = serverCertificateStore.get(id.toUpperCase())
  if (!cert) {
    return NextResponse.json({ error: 'Certificate not found on ledger' }, { status: 404 })
  }

  return NextResponse.json(cert)
}

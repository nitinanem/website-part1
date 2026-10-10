import { CredentialCertificateCard } from '@/components/training/credential-certificate'

export default function CertificateDemoPage() {
  const mockCertificate = {
    certificateId: 'SWASTIK-1234-ABCD-5678',
    recipientName: 'Dr. Jane Doe',
    topicId: 'know-oa',
    topicTitle: 'Understanding Osteoarthritis',
    issuedAt: new Date().toISOString(),
    scorePercent: 95,
    averageTimePerQuestion: 15,
    activeStudyTimeSeconds: 1200,
    antiCheatStatus: { tabSwitches: 0 },
    verificationUrl: 'http://localhost:3000/verify?id=SWASTIK-1234-ABCD-5678',
    blockchainProof: {
      network: 'Solana Devnet',
      blockNumber: 12345678,
      smartContractAddress: 'SWTKh1R...9mP',
      blockHash: '0x9a8b...1c2d',
      txHash: '0x3e4f...5a6b',
      merkleRoot: '0x7c8d...9e0f',
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Certificate Preview</h1>
        <p className="text-muted-foreground mt-2">This is a preview of the final training certificate.</p>
      </div>
      <CredentialCertificateCard certificate={mockCertificate} />
    </div>
  )
}

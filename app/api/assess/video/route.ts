import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

/**
 * POST /api/assess/video
 * Proxies the multipart video upload to the FastAPI backend.
 * The browser sends the form to Next.js; Next.js forwards it to FastAPI.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const response = await fetch(`${FASTAPI_URL}/api/assess/video`, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type — fetch sets it automatically with boundary
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[assess/video proxy]', err)
    return NextResponse.json(
      { error: 'Failed to reach AI backend', details: err.message },
      { status: 502 }
    )
  }
}

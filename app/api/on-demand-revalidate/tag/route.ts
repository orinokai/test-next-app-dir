import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
  revalidateTag('collection')
  return NextResponse.json({ revalidated: true, now: Date.now() })
}

export const dynamic = 'force-dynamic'

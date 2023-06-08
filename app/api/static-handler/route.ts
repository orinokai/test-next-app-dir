import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(`https://strangerthings-quotes.vercel.app/api/quotes`)
  const data = await res.json()

  return NextResponse.json({ data, now: Date.now() })
}

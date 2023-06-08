import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const res = await fetch(`https://api.tvmaze.com/shows/${Number(id)}`)
  const data = await res.json()

  return NextResponse.json({ data })
}

export const runtime = 'edge'

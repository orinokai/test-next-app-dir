import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: number } }) {
  const res = await fetch(`https://api.tvmaze.com/shows/${Number(params.id)}`)
  const data = await res.json()

  return NextResponse.json({ data })
}

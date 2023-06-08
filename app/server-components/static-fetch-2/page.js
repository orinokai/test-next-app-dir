async function getData() {
  const res = await fetch(`https://strangerthings-quotes.vercel.app/api/quotes`, { next: { tags: ['collection'] } })
  return res.json()
}

// app/page.js
// This file maps to the index route (/)
export default async function Page() {
  const data = await getData()

  return (
    <h1>
      Hello, Statically Rendered Server Component with {data[0].quote} at {Date.now()}
    </h1>
  )
}

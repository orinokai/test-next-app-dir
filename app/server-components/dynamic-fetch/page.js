async function getData() {
  const res = await fetch(`https://api.tvmaze.com/shows/1`, {
    cache: 'no-store',
  })
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return res.json()
}

// app/page.js
// This file maps to the index route (/)
export default async function Page() {
  const data = await getData()

  return <h1>Hello, Dynamically Rendered Server Component with {data.name}</h1>
}

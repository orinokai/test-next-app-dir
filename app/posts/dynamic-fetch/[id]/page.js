export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}

async function getData(params) {
  const res = await fetch(`https://api.tvmaze.com/shows/${params.id}`, {
    cache: "no-store",
  });
  return res.json();
}

// app/page.js
// This file maps to the index route (/)
export default async function Page({ params }) {
  const data = await getData(params);

  return <h1>Hello, Dynamically Rendered Server Component with {data.name}</h1>;
}

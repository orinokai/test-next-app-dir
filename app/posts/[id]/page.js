// app/page.js
// This file maps to the index route (/)
export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}

export default function Page({ params }) {
  return <h1>Hello, Next.js at {params.id}</h1>;
}

import Counter from "../../../components/counter";

async function getData() {
  const res = await fetch(`https://api.tvmaze.com/shows/1`);
  return res.json();
}

// app/page.js
// This file maps to the index route (/)
export default async function Page() {
  const data = await getData();

  return (
    <div>
      <h1>
        Hello, Statically Rendered Server Component with Client Component and{" "}
        {data.name}
      </h1>
      <Counter />
    </div>
  );
}

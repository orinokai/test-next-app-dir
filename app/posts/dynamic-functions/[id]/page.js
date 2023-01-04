import { headers } from "next/headers";

export async function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }];
}

export const dynamicParams = false;

// app/page.js
// This file maps to the index route (/)
export default function Page({ params }) {
  const headersList = headers();
  const referer = headersList.get("referer");

  return (
    <h1>
      Hello, Dynamically Rendered Server Component from {referer} at {params.id}
    </h1>
  );
}

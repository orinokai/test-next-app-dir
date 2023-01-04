import { headers } from "next/headers";

// app/page.js
// This file maps to the index route (/)
export default function Page() {
  const headersList = headers();
  const referer = headersList.get("referer");

  return <h1>Hello, Dynamically Rendered Server Component from {referer}</h1>;
}

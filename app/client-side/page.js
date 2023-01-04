import Counter from "../components/counter";

// app/page.js
// This file maps to the index route (/)
export default function Page() {
  return (
    <div>
      <h1>Hello, Statically Rendered Server Component with Client Component</h1>
      <Counter />
    </div>
  );
}

import Link from 'next/link'

export default function Page() {
  return (
    <ul>
      <li>
        <Link href="/server-components">Server components</Link>
      </li>
      <li>
        <Link href="/client-components">Client componens</Link>
      </li>
    </ul>
  )
}

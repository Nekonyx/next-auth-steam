'use client'

import { useSession } from 'next-auth/react'

export default function Page() {
  const session = useSession()

  return (
    <div>
      <p>This is CSR page with useSession()</p>
      <ul>
        <li>Session status: {session.status}</li>
        <li>
          Session data:
          <pre>{JSON.stringify(session.data, null, 2)}</pre>
        </li>
      </ul>
    </div>
  )
}

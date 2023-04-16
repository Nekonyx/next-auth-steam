'use client'
import { useSession } from 'next-auth/react'

export default function About() {
  return (
    <div>
      <p>
        This is CSR Page with <strong>useSession()</strong>
      </p>
      <AboutYou />
    </div>
  )
}

function AboutYou() {
  const session = useSession()

  if (session.status === 'loading') {
    return <p>loading...</p>
  }

  if (session.status !== 'authenticated') {
    return <p>You're not authenticated</p>
  }

  return <pre>{JSON.stringify(session.data, null, 2)}</pre>
}

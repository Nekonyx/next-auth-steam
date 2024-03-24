import { useSession } from 'next-auth/react'

export default function Page() {
  const session = useSession({
    required: true
  })

  if (session.status !== 'authenticated') {
    return `You're not authenticated`
  }

  return (
    <div>
      <h1>next-auth-steam</h1>
      <pre>{JSON.stringify(session.data, null, 2)}</pre>
    </div>
  )
}

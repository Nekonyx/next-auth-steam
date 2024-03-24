import { getServerSession } from 'next-auth'
import { getAuthOptions } from './auth'

export default async function IndexPage() {
  const session = await getServerSession(getAuthOptions())

  return (
    <div>
      <p>This is SSR page with getServerSession()</p>
      <ul>
        <li>Session status: {session ? 'authenticated' : 'unauthenticated'}</li>
        <li>
          Session data:
          <pre>{JSON.stringify(session?.user ?? null, null, 2)}</pre>
        </li>
      </ul>
    </div>
  )
}

import AuthButton from '@/components/auth-button'
import SessionData from '@/components/session-data'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from './auth'

export default async function Home() {
  const session = await getServerSession(getAuthOptions())

  return (
    <div>
      <h1>App Router Example</h1>

      {/* Buttons */}
      <div>
        <p>Action:</p>
        <AuthButton />
      </div>

      <hr />

      {/* getServerSession */}
      <div>
        <p>
          <code>await getServerSession</code> returns:
        </p>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>

      <hr />

      {/* useSession */}
      <div>
        <p>
          <code>useSession</code> returns:
        </p>
        <SessionData />
      </div>
    </div>
  )
}

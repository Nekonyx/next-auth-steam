import { getServerSession } from 'next-auth'
import { Fragment } from 'react'
import AuthButton from './auth-button'

export default async function Home() {
  const session = await getServerSession()

  return (
    <div>
      <h1>App Router Simple Example</h1>
      <p>Welcome, {session?.user?.name ?? 'Guest'}!</p>
      <AuthButton />

      {session && (
        <Fragment>
          <p>Your data:</p>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </Fragment>
      )}
    </div>
  )
}

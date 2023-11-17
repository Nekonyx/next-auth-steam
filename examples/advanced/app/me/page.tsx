import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getAuthOptions } from '../api/auth/[...nextauth]/route'

export default async function MyPage() {
  // @ts-ignore
  const session = await getServerSession(getAuthOptions())

  if (!session) {
    redirect('/')
  }

  const { user } = session

  return (
    <div>
      <p>
        This is a ServerPage with <strong>getServerSession()</strong>. no client
        JS
      </p>
      <img src={user?.image!} alt={user?.name!} />
      <pre>{JSON.stringify(session.user)}</pre>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}

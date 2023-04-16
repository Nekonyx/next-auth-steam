import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function MyPage() {
  const session = await getServerSession()

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
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}

import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

import { getAuthOptions } from './api/auth/[...nextauth]'

export interface IProps {
  // next.js is not passing the session for some reason if property called `session`
  userSession: Session | null
}

export default function IndexPage({ userSession }: IProps) {
  useEffect(() => {
    if (!userSession?.user) {
      signIn()
    }
  }, [userSession])

  if (!userSession?.user) {
    return <div>You're not authenticated</div>
  }

  return (
    <div>
      <h1>next-auth-steam</h1>
      <pre>{JSON.stringify(userSession, null, 2)}</pre>
    </div>
  )
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<IProps>> {
  const userSession = await getServerSession(
    context.req,
    context.res,
    // @ts-expect-error
    getAuthOptions(context.req)
  )

  return {
    props: {
      userSession
    }
  }
}

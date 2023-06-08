import { getServerSession } from 'next-auth'
import { Fragment } from 'react'

import { SignIn, SignOut } from './Sign'

export default async function IndexPage() {
  const session = await getServerSession()

  return (
    <div>
      {session ? (
        <Fragment>
          <p>Hi, you're here!</p>
          <SignOut />
        </Fragment>
      ) : (
        <Fragment>
          Do you want to play with me? <SignIn />
        </Fragment>
      )}
    </div>
  )
}

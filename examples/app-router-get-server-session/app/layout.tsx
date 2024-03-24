import { getServerSession } from 'next-auth'
import Link from 'next/link'
import React, { PropsWithChildren } from 'react'

import { SignIn, SignOut } from './buttons'
import { Providers } from './providers'

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getServerSession()

  return (
    <html>
      <body>
        <h1>next-auth-steam</h1>
        <header>
          <Link href="/">Server-Side Rendering</Link>&nbsp;
          <Link href="/csr">Client-Side Rendering</Link>&nbsp;
          {session ? <SignOut /> : <SignIn />}
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

## next-auth-steam

steam authentication provider for [next-auth](https://npm.im/next-auth).

### Usage:

```ts
// pages/api/auth/[...nextauth].ts
import { NextApiRequest, NextApiResponse } from 'next'

import NextAuth from 'next-auth'
import SteamProvider from 'next-auth-steam'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      SteamProvider(req, {
        clientSecret: process.env.STEAM_SECRET!,
        callbackUrl: 'http://localhost:3000/api/auth/callback'
      })
    ]
  })
}
```

#### To obtain all the data of a Steam user, use these two callbacks to retrieve the user's information

https://next-auth.js.org/getting-started/example#using-nextauthjs-callbacks

```ts
return NextAuth(req, res, {
  providers: [
    SteamProvider(...)
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.provider === PROVIDER_ID) {
        token.steam = profile
      }

      return token
    },
    session({ session, token }) {
      if ('steam' in token) {
        // @ts-expect-error
        session.user.steam = token.steam
      }

      return session
    }
  }
})
```

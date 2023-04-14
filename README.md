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

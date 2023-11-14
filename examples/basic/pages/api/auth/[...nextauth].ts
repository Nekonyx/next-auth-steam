import SteamProvider from '@hyperplay/next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return NextAuth(req, res, {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
      })
    ]
  })
}

import SteamProvider from '@hyperplay/next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextRequest } from 'next/server'

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  return NextAuth(req, ctx, {
    providers: [
      SteamProvider(
        {
          clientSecret: process.env.STEAM_SECRET!,
          nextAuthUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback`
        },
        req
      )
    ]
  })
}

export { handler as GET, handler as POST }

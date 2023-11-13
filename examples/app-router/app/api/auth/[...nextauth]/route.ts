import SteamProvider from 'next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextRequest } from 'next/server'

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  // @ts-expect-error
  return NextAuth(req, ctx, {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
      })
    ]
  })
}

export { handler as GET, handler as POST }

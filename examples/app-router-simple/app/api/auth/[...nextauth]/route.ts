import NextAuth from 'next-auth'
import Steam from 'next-auth-steam'
import type { NextRequest } from 'next/server'

// Learn more: https://next-auth.js.org/configuration/initialization#route-handlers-app
async function auth(
  req: NextRequest,
  ctx: {
    params: {
      nextauth: string[]
    }
  }
) {
  return NextAuth(req, ctx, {
    providers: [
      Steam(req, {
        clientSecret: process.env.STEAM_SECRET!
      })
    ]
  })
}

export { auth as GET, auth as POST }

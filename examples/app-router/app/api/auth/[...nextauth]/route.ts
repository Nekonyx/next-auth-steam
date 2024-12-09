import NextAuth from 'next-auth'
import type { NextRequest } from 'next/server'
import { getAuthOptions } from '../../../auth'

// Learn more: https://next-auth.js.org/configuration/initialization#route-handlers-app
async function auth(
  req: NextRequest,
  ctx: {
    params: {
      nextauth: string[]
    }
  }
) {
  return NextAuth(req, ctx, getAuthOptions(req))
}

export { auth as GET, auth as POST }

import { AuthOptions } from 'next-auth'
import SteamProvider, { PROVIDER_ID } from '@hyperplay/next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return NextAuth(req, res, getAuthOptions(req))
}

export function getAuthOptions(req: NextApiRequest): AuthOptions {
  return {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
      })
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
  }
}

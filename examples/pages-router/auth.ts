import type { NextApiRequest } from 'next'
import type { AuthOptions } from 'next-auth'
import Steam, { STEAM_PROVIDER_ID } from 'next-auth-steam'

export function getAuthOptions(req: NextApiRequest): AuthOptions {
  return {
    providers: [
      Steam(req, {
        clientSecret: process.env.STEAM_SECRET!
      })
    ],
    callbacks: {
      jwt({ token, account, profile }) {
        if (account?.provider === STEAM_PROVIDER_ID) {
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

import { NextRequest } from 'next/server'
import { AuthOptions } from 'next-auth'
import SteamProvider, { STEAM_PROVIDER_ID } from '@hyperplay/next-auth-steam'
import { NextApiRequest } from 'next'

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SteamProvider({
      clientSecret: process.env.STEAM_CLIENT_SECRET!,
      // /api/auth/callback/discord?code=465468 302 in 1524ms
      // `${process.env.NEXTAUTH_URL!}/oauth/steam`

      nextAuthUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback` //process.env.NEXTAUTH_URL!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Handle after sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle your redirection if any
      return baseUrl
    },
    async session({ session, user, token }) {
      // Handle your session
      if ('steam' in token) {
        session.user.steam = token.steam
      }

      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // Handle your jwt
      if (account?.provider === STEAM_PROVIDER_ID) {
        token.steam = profile
      }

      return token
    }
  }
}

export const authOptionsWithRequest: (
  request: NextApiRequest | NextRequest
) => AuthOptions = (request: NextApiRequest | NextRequest) => {
  return {
    ...authOptions,
    providers: [
      ...authOptions.providers.filter(({ id }) => id !== STEAM_PROVIDER_ID),
      SteamProvider(
        {
          clientSecret: process.env.STEAM_CLIENT_SECRET!,
          nextAuthUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback`
        },
        request
      )
    ]
  }
}

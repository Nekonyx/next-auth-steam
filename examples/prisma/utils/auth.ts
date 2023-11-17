import { NextRequest } from 'next/server'
import { AuthOptions } from 'next-auth'
import SteamProvider, { STEAM_PROVIDER_ID } from '@hyperplay/next-auth-steam'
import { NextApiRequest } from 'next'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    async session({ session }) {
      const prismaUser = await prisma.user.findUnique({
        where: {
          email: session.user?.email!
        },
        include: {
          accounts: true
        }
      })

      const steamAccount = prismaUser?.accounts.find(
        (a) => a.provider == 'steam'
      )

      // @ts-expect-error
      session.user.steamId = steamAccount?.steamId

      return session
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

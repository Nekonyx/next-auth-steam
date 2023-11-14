import { AuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import SteamProvider from '@hyperplay/next-auth-steam'

import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return NextAuth(req, res, getAuthOptions())
}

export function getAuthOptions(): AuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
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
    },
    secret: process.env.JWT_SECRET!
  }
}

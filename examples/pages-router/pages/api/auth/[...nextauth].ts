import { getAuthOptions } from '@/auth'
import type { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth/next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, getAuthOptions(req))
}

import NextAuth from 'next-auth'
import { authOptionsWithRequest } from '@/utils/auth'

const auth = async (req: any, res: any) => {
  return await NextAuth(req, res, authOptionsWithRequest(req))
}

export { auth as GET, auth as POST }

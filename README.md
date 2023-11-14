# @hyperplay/next-auth-steam

Your Next.js app with seamless Steam authentication! 🎉

This is a streamlined and improved version of the Steam authentication provider for [next-auth](https://npm.im/next-auth)! 🎮 This package is a fork of [Nekonyx/next-auth-steam](https://github.com/Nekonyx/next-auth-steam), designed to optimize your authentication flow and eliminate unnecessary overhead. Say goodbye to the mandatory `request` parameter and the frequent need for `getServersideProps`—this implementation is all about efficiency and developer happiness! 😄

## 🌟 What's New?

- ✨ No more need for `request` as a required parameter!
- 🛠️ Simplified implementation for `getServerSession`.
- 🔥 Examples and usage patterns to get you started in no time!

## 📦 Install

```bash
npm install @hyperplay/next-auth-steam
```

```bash
yarn add @hyperplay/next-auth-steam
```

```bash
pnpm install @hyperplay/next-auth-steam
```

## 🔍 Example Usage

### 🔹 Basic Authentication Setup

```ts
// pages/api/auth/[...nextauth].ts
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import SteamProvider from '@hyperplay/next-auth-steam'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
        nextAuthUrl: process.env.NEXTAUTH_URL!
      })
    ]
  })
}
```

### 🔹 Custom Provider Id

```ts
// pages/api/auth/[...nextauth].ts
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import SteamProvider from '@hyperplay/next-auth-steam'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      SteamProvider({
        clientId: process.env.STEAM_ID!
        clientSecret: process.env.STEAM_SECRET!
        nextAuthUrl: process.env.NEXTAUTH_URL!
      })
    ]
  })
}
```

### 🔹 App Directory Integration

```ts
// app/api/auth/[...nextauth]/route.ts
async function handler(
  req: NextRequest,
  ctx: {
    params: {
      nextauth: string[]
    }
  }
) {
  // @ts-ignore
  return NextAuth(req, ctx, {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
        nextAuthUrl: process.env.NEXTAUTH_URL!
      })
    ]
  })
}

export { handler as GET, handler as POST }
```

### 🔹 Fetching Steam User Data

To capture the full essence of a Steam user's profile, follow the pattern below:

```ts
import { PROVIDER_ID } from '@hyperplay/next-auth-steam'

// ...

return NextAuth(req, res, {
  providers: [
    SteamProvider( ... )
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
        // Pass a generic type in ts, so you can have your custom session
        session.user.steam = token.steam
      }

      return session
    }
  }
})
```

Dive into more examples in the [examples](examples) folder and get your Steam integration up and running like a charm! 🌈

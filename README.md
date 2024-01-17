# next-auth-steam

steam authentication provider for [next-auth](https://npm.im/next-auth).

## Usage

### Using App Router

```ts
// app/api/auth/[...nextauth]/route.ts
async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  // @ts-ignore
  return NextAuth(req, ctx, {
    providers: [
      SteamProvider(req, {
        clientSecret: process.env.STEAM_SECRET!,
        callbackUrl: 'http://localhost:3000/api/auth/callback'
      })
    ]
  })
}

export {
  handler as GET,
  handler as POST
}
```

### Using Pages Router

```ts
// pages/api/auth/[...nextauth].ts
import { NextApiRequest, NextApiResponse } from 'next'

import NextAuth from 'next-auth'
import SteamProvider from 'next-auth-steam'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      SteamProvider(req, {
        clientSecret: process.env.STEAM_SECRET!,
        callbackUrl: 'http://localhost:3000/api/auth/callback'
      })
    ]
  })
}
```

### Retrieving Steam profile data

Use next-auth's [callbacks](https://next-auth.js.org/getting-started/example#using-nextauthjs-callbacks) to retrieve Steam profile data:

```ts
// (pages/app)/api/auth/[...nextauth].ts
import { PROVIDER_ID } from 'next-auth-steam'

return NextAuth(req, res, {
  providers: [
    SteamProvider(req, {
      clientSecret: process.env.STEAM_SECRET!,
      callbackUrl: 'http://localhost:3000/api/auth/callback'
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
})

// Somewhere in your components
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data } = useSession()

  return <div>Hello, {data?.user.steam.personaname}</div>
}
```

More examples are in [examples](examples) folder.

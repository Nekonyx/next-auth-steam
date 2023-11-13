# next-auth-steam

steam authentication provider for [next-auth](https://npm.im/next-auth).

## Example

### Basic usage

```ts
// pages/api/auth/[...nextauth].ts
import { NextApiRequest, NextApiResponse } from 'next'

import NextAuth from 'next-auth'
import SteamProvider from 'next-auth-steam'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
      })
    ]
  })
}
```

### App directory usage

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
      })
    ]
  })
}

export {
  handler as GET,
  handler as POST
}
```

### Retrieve Steam user information

To obtain all data of Steam user, use these two callbacks to retrieve user's information:

https://next-auth.js.org/getting-started/example#using-nextauthjs-callbacks

```ts
import { PROVIDER_ID } from 'next-auth-steam'

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
        // @ts-expect-error
        session.user.steam = token.steam
      }

      return session
    }
  }
})
```

Other examples are in [examples](examples) folder.

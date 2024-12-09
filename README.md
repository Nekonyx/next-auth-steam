# next-auth-steam

Steam authentication provider for [NextAuth.js](https://authjs.dev).

> [!IMPORTANT]
> This branch (`master`) contains the module for NextAuth.js v4. [Click here](https://github.com/nekonyx/next-auth-steam/tree/beta) to switch to the `beta` branch with support for NextAuth.js v5.

### Install

```
npm install next-auth-steam
```

### Quickstart

1. Create a `.env` file. For configuration details, see: [NextAuth Configuration Options](https://next-auth.js.org/configuration/options).

```dotenv
# .env
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

#### Using App Router

```ts
// app/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import Steam from 'next-auth-steam'
import type { NextRequest } from 'next/server'

// Learn more: https://next-auth.js.org/configuration/initialization#route-handlers-app
async function auth(
  req: NextRequest,
  ctx: {
    params: {
      nextauth: string[]
    }
  }
) {
  return NextAuth(req, ctx, {
    providers: [
      Steam(req, {
        clientSecret: process.env.STEAM_SECRET!
      })
    ]
  })
}

export { auth as GET, auth as POST }
```

#### Using Pages Router

```ts
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import Steam from 'next-auth-steam'
import type { NextApiRequest, NextApiResponse } from 'next'

// Learn more: https://next-auth.js.org/configuration/initialization#advanced-initialization
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, {
    providers: [
      Steam(req, {
        clientSecret: process.env.STEAM_SECRET!
      })
    ]
  })
}
```

### Examples

> [!NOTE]
> Pages Router example uses Next.js 13. App Router example uses the latest version (Next.js 15).

All examples are located in the [`examples`](https://github.com/nekonyx/next-auth-steam/tree/master/examples) folder. Feel free to open a PR if you'd like to add another example!

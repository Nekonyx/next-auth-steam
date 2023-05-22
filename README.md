# Steam provider for NextAuth.JS
Steam authentication provider for [next-auth](https://npm.im/next-auth).

## Example
- [App Router](#app-router-usage)
- [Pages Router](#pages-router-usage)

Check other examples in [examples](examples) folder.

### App Router usage

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";

import type { NextApiRequest, NextApiResponse } from "next";
import SteamProvider from "next-auth-steam";

const handler = (req: NextApiRequest, ctx: NextApiResponse) =>
  NextAuth(req, ctx, {
    providers: [
      SteamProvider(req, {
        clientId: "steam",
        clientSecret: process.env.STEAM_API_KEY!,
        callbackUrl: "http://localhost:3000/api/auth/callback",
      }),
    ],
  });

export { handler as GET, handler as POST };
```

### Pages Router usage

```ts
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";

import type { NextApiRequest, NextApiResponse } from "next";
import SteamProvider from "next-auth-steam";

// @see ./lib/auth
const handler = (req: NextApiRequest, ctx: NextApiResponse) =>
  NextAuth(req, ctx, {
    providers: [
      SteamProvider(req, {
        clientId: "steam",
        clientSecret: process.env.STEAM_API_KEY!,
        callbackUrl: "http://localhost:3000/api/auth/callback",
      }),
    ],
  });

export default handler;
```

### Retrieve Steam user information

To obtain all data of Steam user, use these two callbacks to retrieve user's information:

https://next-auth.js.org/getting-started/example#using-nextauthjs-callbacks

```ts
// ...
return NextAuth(req, res, {
  providers: [
    SteamProvider( ... )
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.provider === "steam") {
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
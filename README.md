## next-auth-steam

steam authentication provider for [next-auth](https://npm.im/next-auth).

### Usage:

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

### App Router usage:
```ts
// app/api/auth/[...nextauth]/route.ts
async function handler(
	req: NextRequest,
	ctx: { params: { nextauth: string[] } }
) {
	//@ts-ignore
	return NextAuth(req, ctx, {
		providers: [
			SteamProvider(req, {
				clientSecret: process.env.STEAM_SECRET!,
				callbackUrl: 'http://localhost:3000/api/auth/callback',
			}),
		],
        ...//callbacks
	});
}

export { handler as GET, handler as POST };

```
### full demo see [examples](examples)
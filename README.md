# @hyperplay/next-auth-steam

Your Next.js app with seamless Steam authentication! 🎉

This is a streamlined and improved version of the Steam authentication provider for [next-auth](https://npm.im/next-auth)! 🎮 This package is a fork of [Nekonyx/next-auth-steam](https://github.com/Nekonyx/next-auth-steam), designed to optimize your authentication flow and eliminate unnecessary overhead. Say goodbye to the mandatory `request` parameter everywhere and the frequent need for `getServersideProps`—this implementation is all about efficiency and developer happiness! 😄

## 🌟 What's New?

- ✨ Request parameter is optional in majority of the cases, although this is required when utilized with `NextAuth`. Therefore for `NextAuth()` you should pass it by default. However on `useSession` or `getServerSession` is optional.
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

This setup can be utlized for both app router and legacy version router.

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";

const auth = async (req: any, res: any) => {
  return await NextAuth(req, res, {
    providers: [
      SteamProvider({
        clientSecret: process.env.STEAM_SECRET!
        nextAuthUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback` // https://example.com/api/auth/callback/steam
      }, req)
    ]
  });
};

export { auth as GET, auth as POST };
```

### 🔹 Advanced Authentication | Real Example

This example covers a real world scenario authentication with fetching of steam user data

```tsx
// utils/auth.ts
import { AuthOptions } from "next-auth";
import { STEAM_PROVIDER_ID } from '@hyperplay/next-auth-steam'

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...
    SteamProvider({
      clientSecret: process.env.STEAM_CLIENT_SECRET!,
      // This will move inside the package soon
      nextAuthUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback`,
    }),
  ]
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      // Handle after sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle your redirection if any
      return baseUrl
    },
    async session({ session, user, token }) {
      // Handle your session
      if ('steam' in token) {
        session.user.steam = token.steam
      }

      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // Handle your jwt
      if (account?.provider === STEAM_PROVIDER_ID) {
        token.steam = profile
      }

      return token
    }
  }
}

export const authOptionsWithRequest: (request: NextApiRequest | NextRequest) = (request: NextApiRequest | NextRequest) => {
  return {
    ...authOptions,
    providers: [
      ...authOptions.providers.filter(({ id }) =>  id !== STEAM_PROVIDER_ID),
      SteamProvider({
        clientSecret: process.env.STEAM_CLIENT_SECRET!,
        nextAuthUrl: `${process.env.NEXTAUTH_URL!}/api/auth/callback`,
      }, request),
    ],
  };
};

// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptionsWithRequest } from "@/utils/auth";

const auth = async (req: any, res: any) => {
  return await NextAuth(req, res, authOptionsWithRequest(req));
};

export { auth as GET, auth as POST };

// app/account/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import Dashboard from '@/components/account/dashboard';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <Dashboard profile={session.profile} />
  );
};
```

Dive into more examples in the [examples](examples) folder and get your Steam integration up and running like a charm! 🌈

## 🗿 Vision

We would like to make the support for Steam seamless as possible

- The package itself we will aim to optimize the bundle size, although since has `openid` npm package which uses node modules makes it difficult. We're using vite at the moment, with `vite-plugin-node-polyfills`.
- `Request` it is something that I'd like to deprecate near the future, another reason why it is optional and only necessary in one place `NextAuth()`. This is difficult at the moment, due of steam has legacy version of `openid`, else it would be easily integrable just like the other providers. You can see further at `next-auth -> core\lib\oauth\callback.js:103`, and a [Vercel/Next discussion](https://github.com/vercel/next.js/discussions/42732) about why request is not accessible on the backend upon callbacks.
- With a hope that steam will upgrade their implementation like the other providers, this package could implement those changes to support steam newer implementation, which eventually we hope that NextJS will have it as part of their providers implementation.

## ⏳ Something went wrong

Let us know about the issue, you can open an issue on the [Github repository](https://github.com/HyperPlay-Gaming/next-auth-steam) | PR's are welcome and it is helpful not only for us, but for everyone else who uses the package & future engineers who require it.

We highly suggest you to make sure that the package is updated to latest version, as we may need to update the implementation as per times changes.

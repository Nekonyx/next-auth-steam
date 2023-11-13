import SteamProvider, {PROVIDER_ID} from 'next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextRequest } from 'next/server'
import {AuthOptions} from "next-auth";

export function getAuthOptions(req: NextRequest): AuthOptions {
    return {
        providers: req
            ? [
                SteamProvider({
                    clientSecret: process.env.STEAM_SECRET!
                }),
            ]
            : [],
        callbacks: {
            jwt({ token, account, profile }) {
                if (account?.provider === PROVIDER_ID) {
                    token.steam = profile;
                }
                return token;
            },
            session({ session, token }) {
                if ('steam' in token) {
                    // @ts-expect-error
                    session.user.steam = token.steam;
                }
                return session;
            },
        },
    };
}

async function handler(
    req: NextRequest,
    ctx: { params: { nextauth: string[] }}
) {
    // @ts-expect-error
    return NextAuth(req, res, getAuthOptions(req));
}

export {
    handler as GET,
    handler as POST,
}
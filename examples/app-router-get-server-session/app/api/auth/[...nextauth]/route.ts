import SteamProvider, {PROVIDER_ID} from 'next-auth-steam'
import NextAuth from 'next-auth/next'

import type { NextRequest } from 'next/server'
import {AuthOptions} from "next-auth";
import {NextApiRequest, NextApiResponse} from "next";
import {NextResponse} from "next/server";

export function getAuthOptions(req?: NextApiRequest): AuthOptions {
    return {
        providers: req
            ? [
                SteamProvider(req, {
                    clientSecret: process.env.STEAM_SECRET!,
                    callbackUrl: 'http://localhost:3000/api/auth/callback',
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
    res: NextResponse
) {
    // @ts-expect-error
    return NextAuth(req, res, getAuthOptions(req));
}

export {
    handler as GET,
    handler as POST,
}
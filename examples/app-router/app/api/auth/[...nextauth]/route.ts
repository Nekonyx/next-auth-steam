import NextAuth from 'next-auth/next';
import { NextRequest } from 'next/server';
import SteamProvider, { PROVIDER_ID } from 'next-auth-steam/src';

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
		callbacks: {
			// #region To obtain all the data of a Steam user, use these two callbacks to retrieve the user's information.
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
			// #endregion
		},
	});
}

export { handler as GET, handler as POST };

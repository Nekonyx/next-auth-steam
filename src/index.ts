import type { NextApiRequest } from "next";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import type { NextRequest } from "next/server";

import { randomUUID } from "crypto";
import { RelyingParty } from "openid";
import { TokenSet } from "openid-client";

export enum CommunityVisibilityState {
  Private = 1,
  Public = 3,
}

export enum PersonaState {
  Offline = 0,
  Online = 1,
  Busy = 2,
  Away = 3,
  Snooze = 4,
  LookingToTrade = 5,
  LookingToPlay = 6,
}

export interface SteamProfile extends Record<string, any> {
  steamid: string;
  communityvisibilitystate: CommunityVisibilityState;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: PersonaState;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  commentpermission: boolean;
}

export default function Steam<P extends SteamProfile>(
  req: NextApiRequest | NextRequest,
  options: OAuthUserConfig<P> & {
    callbackUrl: string | URL;
  }
): OAuthConfig<P> {
  const { callbackUrl, ...rest } = options;
  const steamCallbackURL = new URL(options.callbackUrl);

  /** @example 'https://example.com/' */
  const realm = steamCallbackURL.origin;
  /** @example 'https://example.com/api/auth/callback/steam' */
  const returnTo = `${steamCallbackURL.href}/steam`;

  return {
    id: "steam",
    name: "Steam",
    type: "oauth",
    idToken: false,
    checks: ["none"],
    clientId: "steam",
    authorization: {
      url: "https://steamcommunity.com/openid/login",
      params: {
        "openid.mode": "checkid_setup",
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id":
          "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.return_to": returnTo,
        "openid.realm": realm,
      },
    },
    token: {
      async request() {
        // May throw an error, dunno should I handle it or no
        const claimedIdentifier = await verifyAssertion(
          req.url!,
          realm,
          returnTo
        );

        if (!claimedIdentifier) {
          throw new Error("Unauthenticated");
        }

        const matches = claimedIdentifier.match(
          /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
        );

        if (!matches) {
          throw new Error("Unauthenticated");
        }

        return {
          tokens: new TokenSet({
            id_token: matches[1],
            access_token: randomUUID(),
          }),
        };
      },
    },
    userinfo: {
      async request(ctx) {
        const response = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${ctx.provider.clientSecret}&steamids=${ctx.tokens.id_token}`
        );

        const data = await response.json();
        return data.response.players[0];
      },
    },
    profile(profile: SteamProfile) {
      /*
       NextJS requires that the user object returned from the callback has an email property.
       So we generate a fake email address using the user's Steam ID.
      */
      return {
        id: profile.steamid,
        image: profile.avatarfull,
        email: `${profile.steamid}@steamcommunity.com`,
        name: profile.personaname,
      };
    },
    style: {
      logo: "https://raw.githubusercontent.com/nekonyx/next-auth-steam/master/logo/steam.svg",
      logoDark:
        "https://raw.githubusercontent.com/nekonyx/next-auth-steam/master/logo/steam-dark.svg",
      bg: "#fff",
      text: "#171a21",
      bgDark: "#171a21",
      textDark: "#fff",
    },
    options: rest,
  };
}

/**
 * Verifies an assertion and returns the claimed identifier if authenticated, otherwise null.
 */
async function verifyAssertion(
  url: string,
  realm: string,
  returnTo: string
): Promise<string | null> {
  const party = new RelyingParty(returnTo, realm, true, false, []);

  const result: {
    authenticated: boolean;
    claimedIdentifier?: string | undefined;
  } = await new Promise((resolve, reject) => {
    party.verifyAssertion(url, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result!);
      }
    });
  });

  if (!result.authenticated) {
    return null;
  }

  return result.claimedIdentifier!;
}

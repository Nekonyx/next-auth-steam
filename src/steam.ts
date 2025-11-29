import { randomUUID } from 'node:crypto'
import type { NextApiRequest } from 'next'
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import type { NextRequest } from 'next/server'

import {
  type CommunityVisibilityState,
  type PersonaState,
  STEAM_AUTHORIZATION_URL,
  STEAM_EMAIL_PSEUDO_DOMAIN,
  STEAM_LOGO_URL,
  STEAM_PROVIDER_ID,
  STEAM_PROVIDER_NAME
} from './constants'
import { claimIdentity } from './utils/openid'

export interface SteamProfile extends Record<string, any> {
  steamid: string
  communityvisibilitystate: CommunityVisibilityState
  profilestate: number
  personaname: string
  profileurl: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  avatarhash: string
  lastlogoff: number
  personastate: PersonaState
  primaryclanid: string
  timecreated: number
  personastateflags: number
  commentpermission: boolean
}

export interface SteamProviderOptions<P>
  extends Omit<OAuthUserConfig<P>, 'clientId' | 'clientSecret'> {
  /**
   * Obtain the key here: [Obtaining Steam Web API Key](https://steamcommunity.com/dev/apikey)
   */
  clientSecret: string
  /**
   * If `callbackUrl` is not provided, the default value from `process.env.NEXTAUTH_URL` is computed and used.
   * **Trailing slash must be removed**.
   *
   * @example 'https://example.com/api/auth/callback'
   */
  callbackUrl?: string
}

export function Steam<P extends SteamProfile>(
  request: Request | NextRequest | NextApiRequest,
  options: SteamProviderOptions<P>
): OAuthConfig<SteamProfile> {
  const callbackUrl = options.callbackUrl
    ? new URL(options.callbackUrl)
    : new URL('/api/auth/callback', process.env.NEXTAUTH_URL)

  // realm: https://example.com
  // returnTo: https://example.com/api/auth/callback/steam
  const realm = callbackUrl.origin
  const returnTo = `${callbackUrl.href}/${STEAM_PROVIDER_ID}`

  if (!options.clientSecret || options.clientSecret.length < 1) {
    throw new Error(
      "Steam provider's `clientSecret` is empty. You can obtain an API key here: https://steamcommunity.com/dev/apikey"
    )
  }

  return {
    options: options as OAuthUserConfig<SteamProfile>,
    id: STEAM_PROVIDER_ID,
    name: STEAM_PROVIDER_NAME,
    type: 'oauth',
    style: {
      logo: STEAM_LOGO_URL,
      logoDark: STEAM_LOGO_URL,
      bg: '#000',
      text: '#fff',
      bgDark: '#000',
      textDark: '#fff'
    },
    idToken: false,
    checks: ['none'],
    clientId: STEAM_PROVIDER_ID,
    authorization: {
      url: STEAM_AUTHORIZATION_URL,
      params: {
        'openid.mode': 'checkid_setup',
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.return_to': returnTo,
        'openid.realm': realm
      }
    },
    token: {
      async request() {
        if (!request.url) {
          throw new Error('No URL found in request object')
        }

        const identity = await claimIdentity(request, realm, returnTo)

        return {
          tokens: {
            id_token: randomUUID(),
            access_token: randomUUID(),
            steamId: identity
          }
        }
      }
    },
    userinfo: {
      async request(ctx) {
        const url = new URL('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002')

        url.searchParams.set('key', ctx.provider.clientSecret as string)
        url.searchParams.set('steamids', ctx.tokens.steamId as string)

        const response = await fetch(url)
        const data = await response.json()

        return data.response.players[0]
      }
    },
    profile(profile: SteamProfile) {
      // Next.js cannot serialize the session if email is missing or null, so user ID with pseudo email domain is specified instead.
      return {
        id: profile.steamid,
        image: profile.avatarfull,
        email: `${profile.steamid}@${STEAM_EMAIL_PSEUDO_DOMAIN}`,
        name: profile.personaname
      }
    }
  }
}

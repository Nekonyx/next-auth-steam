import { randomUUID } from 'crypto'
import { RelyingParty } from 'openid'
import { TokenSet } from 'openid-client'
import {
  EMAIL_DOMAIN,
  PROVIDER_ID,
  PROVIDER_NAME,
  SteamProfile
} from './constants'
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'

// prettier-ignore
export interface SteamProviderOptions extends Partial<OAuthUserConfig<SteamProfile>> {
  clientSecret: string;
}

export function Steam(
  options: SteamProviderOptions
): OAuthConfig<SteamProfile> {
  const callbackUrl = new URL(process.env.NEXTAUTH_URL || '')

  // https://example.com
  // https://example.com/api/auth/callback/steam
  const realm = callbackUrl.origin
  const returnTo = `${callbackUrl.href}/${PROVIDER_ID}`
  const path = callbackUrl.pathname + callbackUrl.search; // This should give you the path and query string, similar to `req.url`.

  return {
    // @ts-expect-error
    options,
    id: PROVIDER_ID,
    name: PROVIDER_NAME,
    type: 'oauth',
    style: {
      logo: 'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/12444ac8e7c44f8a69fa007b056f892240cb1a27/logo/steam.svg',
      logoDark:
        'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/12444ac8e7c44f8a69fa007b056f892240cb1a27/logo/steam-dark.svg',
      bg: '#fff',
      text: '#000',
      bgDark: '#000',
      textDark: '#fff'
    },
    idToken: false,
    checks: ['none'],
    clientId: PROVIDER_ID,
    authorization: {
      url: 'https://steamcommunity.com/openid/login',
      params: {
        'openid.mode': 'checkid_setup',
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id':
          'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.return_to': returnTo,
        'openid.realm': realm
      }
    },
    token: {
      async request() {
        // May throw an error, dunno should I handle it or no
        const claimedIdentifier = await verifyAssertion(path, realm, returnTo)

        if (!claimedIdentifier) {
          throw new Error('Unauthenticated')
        }

        const matches = claimedIdentifier.match(
          /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
        )

        if (!matches) {
          throw new Error('Unauthenticated')
        }

        return {
          tokens: new TokenSet({
            id_token: randomUUID(),
            access_token: randomUUID(),
            steamId: matches[1]
          })
        }
      }
    },
    userinfo: {
      async request(ctx) {
        const response = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${ctx.provider.clientSecret}&steamids=${ctx.tokens.steamId}`
        )

        const data = await response.json()

        return data.response.players[0]
      }
    },
    profile(profile: SteamProfile) {
      // next.js can't serialize the session if email is missing or null, so I specify user ID
      return {
        id: profile.steamid,
        image: profile.avatarfull,
        email: `${profile.steamid}@${EMAIL_DOMAIN}`,
        name: profile.personaname
      }
    }
  }
}

/**
 * Verifies an assertion and returns the claimed identifier if authenticated, otherwise null.
 */
async function verifyAssertion(
  url: string,
  realm: string,
  returnTo: string
): Promise<string | null> {
  const party = new RelyingParty(returnTo, realm, true, false, [])

  const result: {
    authenticated: boolean
    claimedIdentifier?: string | undefined
  } = await new Promise((resolve, reject) => {
    party.verifyAssertion(url, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result!)
      }
    })
  })

  if (!result.authenticated) {
    return null
  }

  return result.claimedIdentifier!
}

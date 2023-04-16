import { randomUUID } from 'crypto'
import { NextApiRequest } from 'next'
import { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import { RelyingParty } from 'openid'
import { TokenSet } from 'openid-client'

import { PROVIDER_ID, PROVIDER_NAME, SteamProfile } from './constants'
import { NextRequest } from 'next/server'

// prettier-ignore
export interface SteamProviderOptions extends Partial<OAuthUserConfig<SteamProfile>> {
  /** @example 'https://example.com/api/auth/callback' */
  callbackUrl: string | URL
}

export function Steam(
  req: NextApiRequest | NextRequest,
  options: SteamProviderOptions
): OAuthConfig<SteamProfile> {
  const callbackUrl = new URL(options.callbackUrl)
  
  // https://example.com
  // https://example.com/api/auth/callback/steam
  const realm = callbackUrl.origin
  const returnTo = `${callbackUrl.href}/${PROVIDER_ID}`

  return {
    // @ts-expect-error
    options,
    id: PROVIDER_ID,
    name: PROVIDER_NAME,
    type: 'oauth',
    style: {
      logo: 'https://raw.githubusercontent.com/nekonyx/next-auth-steam/master/logo/steam.svg',
      logoDark:
        'https://raw.githubusercontent.com/nekonyx/next-auth-steam/master/logo/steam-dark.svg',
      bg: '#000',
      text: '#fff',
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
        const claimedIdentifier = await verifyAssertion(req, realm, returnTo)

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
      return {
        id: profile.steamid,
        image: profile.avatarfull,
        name: profile.personaname
      }
    }
  }
}

/**
 * Verifies an assertion and returns the claimed identifier if authenticated, otherwise null.
 */
async function verifyAssertion(
  req: NextApiRequest | NextRequest,
  realm: string,
  returnTo: string
): Promise<string | null> {
  const party = new RelyingParty(returnTo, realm, true, false, [])

  const result: {
    authenticated: boolean
    claimedIdentifier?: string | undefined
  } = await new Promise((resolve, reject) => {
    const reqOrUrl = req instanceof Request ? req.url : req;
    party.verifyAssertion(reqOrUrl, (error, result) => {
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

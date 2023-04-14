import { NextApiRequest } from 'next'
import { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import { RelyingParty } from 'openid'

import { PROVIDER_ID, PROVIDER_NAME, SteamProfile } from './constants'

// prettier-ignore
export interface SteamProviderOptions extends Partial<OAuthUserConfig<SteamProfile>> {
  /** @example 'https://example.com/api/auth/callback' */
  callbackUrl: string | URL
}

export function Steam(
  req: NextApiRequest,
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
        const openid = new RelyingParty(returnTo, realm, true, false, [])

        const result: {
          authenticated: boolean
          claimedIdentifier?: string | undefined
        } = await new Promise((resolve, reject) => {
          openid.verifyAssertion(req, (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result!)
            }
          })
        })

        if (!result.authenticated) {
          throw new Error('Unauthenticated')
        }

        const matches = result.claimedIdentifier?.match(
          /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
        )

        if (!matches) {
          throw new Error('Unauthenticated')
        }

        return {
          tokens: {
            steamId: matches[1]
          }
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

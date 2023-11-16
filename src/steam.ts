import { randomUUID } from 'node:crypto'
import { RelyingParty } from 'openid'
import { TokenSet } from 'openid-client'
import {
  EMAIL_DOMAIN,
  PROVIDER_ID,
  PROVIDER_NAME,
  SteamProfile,
  VerifyAssertionResult
} from '@/constants'
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'

/**
 * Represents the additional configuration options required for the Steam provider.
 *
 * @extends OAuthUserConfig<SteamProfile>
 */
export interface SteamProviderOptions extends OAuthUserConfig<SteamProfile> {
  clientSecret: string
  nextAuthUrl?: string
}

/**
 * Creates a configuration object for the Steam authentication provider.
 *
 * @param {SteamProviderOptions} providerOptions - The options required to configure the Steam provider.
 * @returns {OAuthConfig<SteamProfile>} The configuration object for NextAuth.
 */
export function Steam(
  providerOptions: SteamProviderOptions
): OAuthConfig<SteamProfile> {
  const {
    nextAuthUrl = 'http://localhost:3000/api/auth/callback',
    clientSecret,
    ...options
  } = providerOptions

  const callbackUrl = new URL(nextAuthUrl)

  const realm = callbackUrl.origin
  const returnTo = callbackUrl.href
  const path = `${callbackUrl.pathname}${callbackUrl.search}`

  return {
    options: {
      ...options,
      clientSecret
    },
    id: PROVIDER_ID,
    name: PROVIDER_NAME,
    type: 'oauth',
    style: getProviderStyle(),
    idToken: false,
    checks: ['none'],
    clientId: PROVIDER_ID,
    authorization: getAuthorizationParams(returnTo, realm),
    token: {
      async request() {
        try {
          const claimedIdentifier = await verifyAssertion(path, realm, returnTo)
          if (!claimedIdentifier) throw new Error('Unauthenticated')

          const steamId = extractSteamId(claimedIdentifier)
          if (!steamId) throw new Error('Unauthenticated')

          return {
            tokens: new TokenSet({
              id_token: randomUUID(),
              access_token: randomUUID(),
              steamId
            })
          }
        } catch (error) {
          console.error(error)
          throw error
        }
      }
    },
    userinfo: {
      async request(ctx) {
        try {
          const response = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${clientSecret}&steamids=${ctx.tokens.steamId}`
          )
          const data = await response.json()
          return data.response.players[0]
        } catch (error) {
          console.error(error)
          throw error
        }
      }
    },
    profile(profile: SteamProfile) {
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
 * Provides the styling options for the Steam provider's buttons and UI elements.
 *
 * @returns {Object} The style configuration object.
 */
const getProviderStyle = () => ({
  logo: 'https://raw.githubusercontent.com/HyperPlay-Gaming/next-auth-steam/b65dc09e98cead3111ecbfaa0ecc15eab7f125d9/logo/steam.svg',
  logoDark:
    'https://raw.githubusercontent.com/HyperPlay-Gaming/next-auth-steam/b65dc09e98cead3111ecbfaa0ecc15eab7f125d9/logo/steam-dark.svg',
  bg: '#121212',
  text: '#fff',
  bgDark: '#000',
  textDark: '#fff'
})

/**
 * Returns the authorization parameters for the Steam OpenID connection.
 *
 * @param {string} returnTo - The URL to which Steam will return after authentication.
 * @param {string} realm - The realm under which the OpenID authentication is performed.
 * @returns {Object} The authorization parameters object.
 */
const getAuthorizationParams = (returnTo: string, realm: string) => ({
  url: 'https://steamcommunity.com/openid/login',
  params: {
    'openid.mode': 'checkid_setup',
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.return_to': returnTo,
    'openid.realm': realm
  }
})

/**
 * Verifies the OpenID authentication assertion.
 *
 * @param {string} url - The URL to which the OpenID provider has sent the assertion response.
 * @param {string} realm - The realm under which the OpenID authentication is performed.
 * @param {string} returnTo - The URL to which Steam will return after authentication.
 * @returns {Promise<string|null>} A promise that resolves with the claimed identifier if authenticated, or null otherwise.
 */
async function verifyAssertion(
  url: string,
  realm: string,
  returnTo: string
): Promise<string | null> {
  const party = new RelyingParty(returnTo, realm, true, false, [])

  const result: VerifyAssertionResult = await new Promise((resolve, reject) => {
    party.verifyAssertion(url, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result!)
      }
    })
  })

  return result.authenticated ? result.claimedIdentifier! : null
}

/**
 * Extracts the Steam ID from the claimed identifier URL.
 *
 * @param {string} claimedIdentifier - The claimed identifier URL returned from Steam OpenID.
 * @returns {string|null} The extracted Steam ID or null if not found.
 */
const extractSteamId = (claimedIdentifier: string): string | null => {
  const matches = claimedIdentifier.match(
    /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
  )
  return matches ? matches[1] : null
}

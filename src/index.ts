import { v4 as uuidv4 } from 'uuid'
import { BaseClient, TokenSet, TokenSetParameters } from 'openid-client'
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import type { NextRequest } from 'next/server'
import type { NextApiRequest } from 'next'
import { Profile } from 'next-auth'

/**
 * The provider ID for Steam authentication.
 */
export const STEAM_PROVIDER_ID = 'steam'
/**
 * The name of the Steam provider.
 */
export const STEAM_PROVIDER_NAME = 'Steam'
/**
 * The domain used for Steam email addresses.
 */
export const STEAM_EMAIL_DOMAIN = 'steamcommunity.com'

/**
 * Represents a Steam profile.
 */
export interface SteamProfile extends Record<string, string | number> {
  /**
   * The Steam ID of the user.
   */
  providerAccountId: number
  /**
   * The current provider
   */
  provider: string
  /**
   * The token id as random uuid4
   */
  id_token: string
  /**
   * The access token which is dummy as random uuid4
   */
  access_token: string
}

export type onUserInfoRequestContext = {
  tokens: TokenSetParameters
} & {
  client: BaseClient
  provider: OAuthConfig<SteamProfile> & {
    signinUrl: string
    callbackUrl: string
  }
}

/**
 * Represents the additional configuration options required for the Steam provider.
 *
 * @extends OAuthUserConfig<SteamProfile>
 */
export interface SteamProviderOptions
  extends Omit<OAuthUserConfig<SteamProfile>, 'clientId' | 'clientSecret'> {
  nextAuthUrl?: string
  onUserInfoRequest?: (ctx: onUserInfoRequestContext) => Promise<object>
}

/**
 * Creates a configuration object for the Steam authentication provider.
 *
 * @param {SteamProviderOptions} providerOptions - The options required to configure the Steam provider.
 * @returns {OAuthConfig<SteamProfile>} The configuration object for NextAuth.
 */
export function Steam(
  providerOptions: SteamProviderOptions,
  request?: NextApiRequest | NextRequest
): OAuthConfig<SteamProfile> {
  const {
    nextAuthUrl = 'http://localhost:3000/api/auth/callback',
    onUserInfoRequest = async () => {
      return {}
    },
    ...options
  } = providerOptions

  const callbackUrl = new URL(nextAuthUrl)

  const realm = callbackUrl.origin
  const returnTo = `${callbackUrl.href}/${STEAM_PROVIDER_ID}`

  return {
    options: {
      ...options
    } as OAuthUserConfig<SteamProfile>,
    id: STEAM_PROVIDER_ID,
    name: STEAM_PROVIDER_NAME,
    type: 'oauth',
    style: getProviderStyle(),
    idToken: false,
    checks: ['none'],
    clientId: STEAM_PROVIDER_ID,
    authorization: getAuthorizationParams(returnTo, realm),
    token: {
      async request() {
        try {
          if (!request?.url) {
            throw new Error(
              'No request URL provided. You will require to pass `request` of any type NextApiRequest or NextRequest, when you need to use `token.request()`. Generally this on SignIn page for outdated openId on Steam.'
            )
          }

          const claimedIdentifier = await verifyAssertion(request.url)

          if (!claimedIdentifier) throw new Error('Unauthenticated')

          const steamId = extractSteamId(claimedIdentifier)

          if (!steamId) throw new Error('Unauthenticated')

          return {
            tokens: new TokenSet({
              id_token: uuidv4(),
              access_token: uuidv4(),
              providerAccountId: steamId,
              provider: STEAM_PROVIDER_ID
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
          const data = await onUserInfoRequest(ctx)

          if (typeof data !== 'object') {
            throw new Error(
              "Something went wrong on onUserInfoRequest, make sure you're returning an object",
              data
            )
          }

          return {
            providerAccountId: ctx.tokens.providerAccountId as string,
            provider: STEAM_PROVIDER_ID,
            ...data
          } as Profile
        } catch (error) {
          console.error(error)
          throw error
        }
      }
    },
    profile(profile: SteamProfile) {
      return {
        id: (profile.providerAccountId as unknown as string) || '',
        email: `${profile.providerAccountId}@${STEAM_EMAIL_DOMAIN}`,
        ...profile
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
 * @returns {Promise<string|null>} A promise that resolves with the claimed identifier if authenticated, or null otherwise.
 */
async function verifyAssertion(url: string): Promise<string | null> {
  if (!url) return null

  const { searchParams } = new URL(url)
  const signed = searchParams.get('openid.signed') || ''
  const token_params: Record<string, string> = {}

  for (const val of signed.split(',')) {
    token_params[`openid.${val}`] = searchParams.get(`openid.${val}`) || ''
  }

  const token_url = new URL('https://steamcommunity.com/openid/login')
  const token_url_params = new URLSearchParams({
    'openid.assoc_handle': searchParams.get('openid.assoc_handle') || '',
    'openid.signed': signed,
    'openid.sig': searchParams.get('openid.sig') || '',
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'check_authentication',
    ...token_params
  })

  token_url.search = token_url_params.toString()

  const token_res = await fetch(token_url, {
    method: 'POST',
    headers: {
      'Accept-language': 'en',
      'Content-type': 'application/x-www-form-urlencoded',
      'Content-Length': `${token_url_params.toString().length}`
    },
    body: token_url_params.toString()
  })

  const result = await token_res.text()

  if (result.match(/is_valid\s*:\s*true/i)) {
    return token_url_params.get('openid.claimed_id')
  }

  return null
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

export default Steam

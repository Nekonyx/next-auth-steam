import { randomUUID } from 'node:crypto'
import { RelyingParty } from 'openid'
import { TokenSet } from 'openid-client'
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers'
import { NextRequest } from 'next/server'
import { NextApiRequest } from 'next'

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
 * Represents the visibility state of a community.
 */
export enum CommunityVisibilityState {
  Private = 1,
  Public = 3
}

/**
 * Represents the possible states of a persona.
 */
export enum PersonaState {
  Offline = 0,
  Online = 1,
  Busy = 2,
  Away = 3,
  Snooze = 4,
  LookingToTrade = 5,
  LookingToPlay = 6
}

/**
 * Represents a Steam profile.
 */
export interface SteamProfile
  extends Record<
    string,
    string | number | boolean | CommunityVisibilityState | PersonaState
  > {
  /**
   * The Steam ID of the user.
   */
  steamid: string

  /**
   * The community visibility state of the user's profile.
   */
  communityvisibilitystate: CommunityVisibilityState

  /**
   * The profile state of the user.
   */
  profilestate: number

  /**
   * The persona name of the user.
   */
  personaname: string

  /**
   * The URL of the user's profile.
   */
  profileurl: string

  /**
   * The URL of the user's avatar.
   */
  avatar: string

  /**
   * The URL of the user's medium-sized avatar.
   */
  avatarmedium: string

  /**
   * The URL of the user's full-sized avatar.
   */
  avatarfull: string

  /**
   * The hash of the user's avatar.
   */
  avatarhash: string

  /**
   * The timestamp of the user's last logoff.
   */
  lastlogoff: number

  /**
   * The persona state of the user.
   */
  personastate: PersonaState

  /**
   * The primary clan ID of the user.
   */
  primaryclanid: string

  /**
   * The timestamp when the user's account was created.
   */
  timecreated: number

  /**
   * The persona state flags of the user.
   */
  personastateflags: number

  /**
   * The comment permission of the user's profile.
   */
  commentpermission: boolean
}


/**
 * Represents the result of verifying an assertion.
 */
export type VerifyAssertionResult = {
  /**
   * Indicates whether the assertion is authenticated or not.
   */
  authenticated: boolean

  /**
   * The claimed identifier associated with the assertion, if available.
   */
  claimedIdentifier?: string | undefined
}


/**
 * Represents the additional configuration options required for the Steam provider.
 *
 * @extends OAuthUserConfig<SteamProfile>
 */
export interface SteamProviderOptions extends Omit<OAuthUserConfig<SteamProfile>, 'clientId'> {
  clientSecret: string
  nextAuthUrl?: string
  clientId?: string
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
    clientSecret,
    ...options
  } = providerOptions

  const callbackUrl = new URL(nextAuthUrl)

  const realm = callbackUrl.origin
  const returnTo = `${callbackUrl.href}/${STEAM_PROVIDER_ID}`

  return {
    options: {
      ...options,
      clientSecret
    },
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

          const claimedIdentifier = await verifyAssertion(
            request.url,
            realm,
            returnTo
          )
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
        email: `${profile.steamid}@${STEAM_EMAIL_DOMAIN}`,
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
  if (!url) return null

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

export default Steam;
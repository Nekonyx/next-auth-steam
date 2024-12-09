import type { NextApiRequest } from 'next'
import { RelyingParty } from 'openid'
import { STEAM_AUTHORIZATION_URL } from '../constants'

const IDENTIFIER_PATTERN = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/
const OPENID_CHECK = {
  ns: 'http://specs.openid.net/auth/2.0',
  claimed_id: 'https://steamcommunity.com/openid/id/',
  identity: 'https://steamcommunity.com/openid/id/'
}

/**
 * Claims the identity by verifying the assertion and extracting the claimed identifier.
 * Uses the `verifyAssertion` method to validate the identity.
 */
export async function claimIdentity(
  request: Request | NextApiRequest,
  realm: string,
  returnTo: string
): Promise<string> {
  const claimedIdentity = await verifyAssertion(request, realm, returnTo)
  const match = claimedIdentity.match(IDENTIFIER_PATTERN)

  if (!match || !match[1]) {
    throw new Error('Claimed identity is invalid')
  }

  return match[1]
}

/**
 * Verifies the OpenID assertion by validating the identity and verifying the assertion with the relying party.
 * Based on the logic from this PR: https://github.com/liamcurry/passport-steam/pull/120
 * and copied from this library: https://github.com/liamcurry/passport-steam/blob/dcebba52d02ce2a12c7d27481490c4ee0bd1ae38/lib/passport-steam/strategy.js#L93
 */
export async function verifyAssertion(
  request: Request | NextApiRequest,
  realm: string,
  returnTo: string
): Promise<string> {
  // Create a new URL object to parse the query string.
  // In Next.js 14, req.url is an absolute URL, but in Next.js 13 it's not, so example.com is used as the base URL.
  const url = new URL(request.url || '', 'https://example.com')
  const query = Object.fromEntries(url.searchParams)

  if (
    query['openid.op_endpoint'] !== STEAM_AUTHORIZATION_URL ||
    query['openid.ns'] !== OPENID_CHECK.ns
  ) {
    throw new Error('Claimed identity is invalid')
  }

  if (!query['openid.claimed_id']?.startsWith(OPENID_CHECK.claimed_id)) {
    throw new Error('Claimed identity is invalid')
  }

  if (!query['openid.identity']?.startsWith(OPENID_CHECK.identity)) {
    throw new Error('Claimed identity is invalid')
  }

  return new Promise((resolve, reject) => {
    const relyingParty = new RelyingParty(returnTo, realm, true, false, [])

    relyingParty.verifyAssertion(request, (error, result) => {
      if (error) {
        return reject(error)
      }

      if (!result || !result.claimedIdentifier || !result.authenticated) {
        throw new Error('Claimed identity is invalid')
      }

      resolve(result.claimedIdentifier)
    })
  })
}

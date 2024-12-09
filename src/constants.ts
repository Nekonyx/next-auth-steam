export const STEAM_PROVIDER_ID = 'steam'

export const STEAM_PROVIDER_NAME = 'Steam'

export const STEAM_EMAIL_PSEUDO_DOMAIN = 'steamcommunity.com'

export const STEAM_AUTHORIZATION_URL = 'https://steamcommunity.com/openid/login'

export const STEAM_LOGO_URL =
  'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/fcc97d9d5ae40b0b9c3e98efb6eda1058d571716/logo/steam-icon.svg'

/** @deprecated Use `STEAM_PROVIDER_ID` instead */
export const PROVIDER_ID = STEAM_PROVIDER_ID

/** @deprecated Use `STEAM_PROVIDER_NAME` instead */
export const PROVIDER_NAME = STEAM_PROVIDER_NAME

/** @deprecated Use `STEAM_EMAIL_PSEUDO_DOMAIN` instead */
export const EMAIL_DOMAIN = STEAM_EMAIL_PSEUDO_DOMAIN

/** @deprecated Use `STEAM_AUTHORIZATION_URL` instead */
export const AUTHORIZATION_URL = 'https://steamcommunity.com/openid/login'

/** @deprecated Use `STEAM_LOGO_URL` instead */
export const LOGO_URL = STEAM_LOGO_URL

export enum CommunityVisibilityState {
  Private = 1,
  Public = 3
}

export enum PersonaState {
  Offline = 0,
  Online = 1,
  Busy = 2,
  Away = 3,
  Snooze = 4,
  LookingToTrade = 5,
  LookingToPlay = 6
}

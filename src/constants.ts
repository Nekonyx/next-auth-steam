export const PROVIDER_ID = 'steam'
export const PROVIDER_NAME = 'Steam'
export const EMAIL_DOMAIN = 'steamcommunity.com'

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

export const LOGO_URL_LIGHT =
  'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/8e66ce4ca6b1a424368fa6d7f14cbc0d24942d35/logo/steam.svg'

export const LOGO_URL_DARK =
  'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/8e66ce4ca6b1a424368fa6d7f14cbc0d24942d35/logo/steam-dark.svg'

export const AUTHORIZATION_URL = 'https://steamcommunity.com/openid/login'

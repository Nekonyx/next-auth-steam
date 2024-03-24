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

export const LOGO_URL =
  'https://raw.githubusercontent.com/Nekonyx/next-auth-steam/bc574bb62be70993c29f6f54c350bdf64205962a/logo/steam-icon-light.svg'

export const AUTHORIZATION_URL = 'https://steamcommunity.com/openid/login'

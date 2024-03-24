import type { CommunityVisibilityState, PersonaState } from './constants'

export interface SteamProfile extends Record<string, any> {
  steamid: string
  communityvisibilitystate: CommunityVisibilityState
  profilestate: number
  personaname: string
  profileurl: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  avatarhash: string
  lastlogoff: number
  personastate: PersonaState
  primaryclanid: string
  timecreated: number
  personastateflags: number
  commentpermission: boolean
}

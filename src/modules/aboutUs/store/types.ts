export interface AboutUsState {
  staking: StakingInfo,
  partners:  PartnersInfo,
  general: GeneralInfo,
  podcast: PodcastInfo,
  contacts: ContactsInfo
}

export interface StakingInfo {
  data: string
}

export interface PartnersInfo {
  data: string
}
export interface GeneralInfo {
  data: string
}
export interface PodcastInfo {
  data: string
}
export interface ContactsInfo {
  data: string
}

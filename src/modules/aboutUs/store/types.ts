export interface AboutUsState {
  staking: StakingInfo
  partners: PartnersInfo
  general: GeneralInfo
  podcast: PodcastInfo
  contacts: ContactsInfo
}

export interface StakingInfo {
  title: string
  data: {
    section: {
      title: string
      textButton: string
    }[]
  }
}

export interface PartnersInfo {
  title: string
  data: {
    name: string
    logo: string
    link: string
  }[]
}

export interface GeneralInfo {
  title: string
  data: {
    description: string[]
    section: {
      title: string
      isModal: boolean
      textButton: string
      isRichText: boolean
      content?: string[]
      richTextContent: string
    }[]
  }
}

export interface PodcastInfo {
  title: string
  data: {
    main: {
      label?: string
      content: string
    }[]
    footer: {
      label: string
      content1: string
      content2: string
      links: {
        rss: string
        amazon: string
        apple: string
        castbox: string
        castro: string
        google: string
        iheart: string
        overcast: string
        pocket: string
        radioPublic: string
        spotify: string
        tunein: string
      }
    }
  }
}
export interface ContactsInfo {
  data: string
}

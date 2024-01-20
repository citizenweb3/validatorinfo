import { TableV2CustomizedHeaderSlotParam } from "element-plus"

export interface DashboardState {
  welcomeText: string
  isSBPin: boolean
  isSBOpen: boolean
}

/**
 * An array of normalized numbers which have a sum of 1. To be used with pie charts
 */
export type DistributionData = number[]

/**
 * A metric score is a number from 0 to 1.
 */
export type MetricScore = number

export interface Link {
  name: string,
  url: string,
  logoUrl: string
}

/**
 * A link correspoding to networks such as Ethereum, Polkadot, Cosmos, Osmosis, etc.
 */
export type NetworkAssetLink = Link

export interface ValidatorOverviewInfo {
  name: string
  supportedAssets: NetworkAssetLink[]
  batteryLevel: number
  tvl: DistributionData
  techScore: MetricScore
  socialScore: MetricScore
  govScore: MetricScore
  userScore: MetricScore
  links: Link[]
}
export interface NetworkState {
  data: NetworkOverviewInfo[]
}

export interface NetworkOverviewInfo {
  id: string,
  name: string,
  tokenPriceUsd: number,
  tokenLabel: string,
  athPriceUsd: number,
  atlPriceUsd: number,
  change24h: number,
  change7d: number,
  change30d: number,
}

import { defineStore } from 'pinia'
import { ValidatorState } from './types'

export const useState = defineStore({
  id: 'validators.state',
  state: (): ValidatorState => {
    return {
      data: [
        {
          name: "Validator One",
          supportedAssets: [
            { name: "Ethereum", url: "https://ethereum.org", logoUrl: "https://app.osmosis.zone/tokens/generated/weth.svg" },
            { name: "Polkadot", url: "https://polkadot.network", logoUrl: "https://app.osmosis.zone/tokens/generated/dot.svg" }
          ],
          batteryLevel: 75,
          tvl: [0.7, 0.3],
          techScore: 0.9,
          socialScore: 0.8,
          govScore: 0.7,
          userScore: 0.85,
          links: [
            { name: "Official Website", url: "https://validatorone.com", logoUrl: "" },
            { name: "Documentation", url: "https://validatorone.com/docs", logoUrl: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" }
          ]
        },
        {
          name: "Validator Two",
          supportedAssets: [
            { name: "Cosmos", url: "https://cosmos.network", logoUrl: "https://app.osmosis.zone/tokens/generated/atom.svg" },
            { name: "Osmosis", url: "https://osmosis.zone", logoUrl: "https://app.osmosis.zone/tokens/generated/osmo.svg" }
          ],
          batteryLevel: 60,
          tvl: [0.2, 0.8],
          techScore: 0.75,
          socialScore: 0.65,
          govScore: 0.8,
          userScore: 0.7,
          links: [
            { name: "Homepage", url: "https://validatorTwo.com", logoUrl: "https://validatorTwo.com/logo.png" },
            { name: "Support", url: "https://validatorTwo.com/support", logoUrl: "https://validatorTwo.com/support/logo.png" }
          ]
        },
  
        // Validator 3
        {
          name: "Validator Three",
          supportedAssets: [
            { name: "Binance Smart Chain", url: "https://bscscan.com", logoUrl: "https://app.osmosis.zone/tokens/generated/bnb.svg" },
            { name: "Avalanche", url: "https://avax.network", logoUrl: "https://app.osmosis.zone/tokens/generated/avax.svg" }
          ],
          batteryLevel: 85,
          tvl: [0.5, 0.5],
          techScore: 0.88,
          socialScore: 0.77,
          govScore: 0.66,
          userScore: 0.78,
          links: [
            { name: "Blog", url: "https://validatorThree.com/blog", logoUrl: "https://validatorThree.com/blog/logo.png" },
            { name: "FAQ", url: "https://validatorThree.com/faq", logoUrl: "https://validatorThree.com/faq/logo.png" }
          ]
        },
      ]
    }
  },
})

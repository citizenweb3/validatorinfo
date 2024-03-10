import { defineStore } from 'pinia'
import { AboutUsState } from './types'

export const useState = defineStore({
  id: 'aboutUsStore.state',
  state: (): AboutUsState => {
    return {
      staking: {data: 'STAKING'},
      partners: { data : 'PARTNERS'},
      general: {title: 'Useful Info', data: [
          {
            label: "Our mission",
            content: 'Citizen Web3 was born out of years of community management and ecosystem development. Today, Citizen Web3 is a project providing infrastructure services as a validator across the blockchain space, one of the oldest web3 podcasts in the space and a community of like-minded people. Our flagship product, validatorinfo.com is a dashboard and an explorer that helps you to discover validators across the space.\n' +
              '\n' +
              'We believe that blockchains should be viewed as digital nations and by using the tools that we hold, we help to build and bring value to these nations. We monetize ourselves via our validators. If we believe that a city can be prosperous, and it meets our values, we start to work around it. In turn, the citizens of the city, read - blockchain users, delegate tokens to our validators, which helps us to keep going.\n' +
              'Our goals are much bigger. We strive and build to becoming the layer-0, i.e. - a community bridge between ecosystems. Running more nodes, creating more content, forming more partnerships, etc.'
          },
          {
            label: "Our mission",
            content: 'Citizen Web3 was born out of years of community management and ecosystem development. Today, Citizen Web3 is a project providing infrastructure services as a validator across the blockchain space, one of the oldest web3 podcasts in the space and a community of like-minded people. Our flagship product, validatorinfo.com is a dashboard and an explorer that helps you to discover validators across the space.\n' +
              '\n' +
              'We believe that blockchains should be viewed as digital nations and by using the tools that we hold, we help to build and bring value to these nations. We monetize ourselves via our validators. If we believe that a city can be prosperous, and it meets our values, we start to work around it. In turn, the citizens of the city, read - blockchain users, delegate tokens to our validators, which helps us to keep going.\n' +
              'Our goals are much bigger. We strive and build to becoming the layer-0, i.e. - a community bridge between ecosystems. Running more nodes, creating more content, forming more partnerships, etc.'
          }
        ]},
      podcast: {data: 'PODCAST'},
      contacts: { data: 'CONTACTS'}
    }
  },
})

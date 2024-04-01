import { defineStore } from 'pinia'
import { AboutUsState } from './types'

export const useState = defineStore({
  id: 'aboutUsStore.state',
  state: (): AboutUsState => {
    return {
      staking: {
        title: 'STAKING',
        data: [
          {
            label: 'STAKING',
            content:
              'Citizen Web3 helps to secure blockchain networks by providing infrastructure. This includes validator, testnet, and various public access nodes. \n' +
              '\n' +
              'We use Multi-party computation software (Horcrux) on all our nodes, to further secure funds, and protect stakers from double signing. We use Re-Stake on all of our mainnet nodes, set to restake twice per day, so users can compound their staking rewards more efficiently.\n' +
              '\n' +
              'Our current target is moving 95% of our infrastructure to (own) baremetal by spring 2024. We strongly believe in decentralized infrastructure, independent of the grid, and thats our end goal.\n' +
              ' \n' +
              'Token holders of networks we validate, can stake with us to help secure these networks and to support our activities. Their incentive for doing so, is earning staking rewards, and other, planned, incentives in the future. We are devoted to our mission, we think out of the box, and are proud to be a little crazy. We value security, decentralization, privacy and lack of enforcement.\n',
          },
        ],
      },
      partners: {
        title: 'PARTNERS',
        data: [
          {
            name: 'Bostrom',
            logo: '@/assets/logos/cyberLogo.svg',
            link: 'https://cyb.ai/',
          },
          {
            name: 'Posthuman',
            logo: '@/assets/logos/posthumanLogo.svg',
            link: 'https://posthuman.digital/',
          },
          {
            name: 'Bro_n_Bro',
            logo: '@/assets/logos/broNbroLogo.svg',
            link: 'https://bronbro.io/',
          },
        ],
      },
      podcast: {
        title: 'Podcast',
        data: {
          main: [
            {
              label: 'Citizen Web3 Podcast',
              content:
                'Citizen Web3 provides infrastructure services as a validator across the blockchain space. It is one of the oldest web3 podcasts in the space and a community of like-minded people. \n' +
                '\n' +
                'We believe in the power of decentralized communities and the potential of blockchains to build a better world. For us blockchains are not just digital technologies, but they are similar to natural hives, forests, and patterns in the environment that allow us to communicate better. We value security, decentralization, privacy, and lack of enforcement. Open and verifiable blockchains should be viewed as digital nations and that our role is to help build and bring value to these nations.',
            },
          ],
          footer: {
            label: 'Subscribe',
            content1:
              'Get the latest episodes of Citizen Web3 automatically using the links above, or by copying and pasting the URL below into your favorite podcast app:',
            content2:
              'You can also subscribe with your favorite app directly, using the buttons below:',
            links: {
              rss: 'https://feeds.fireside.fm/citizenweb3/rss',
              apple: 'https://podcasts.apple.com/podcast/citizen-web3/id1510241147',
              amazon: 'https://podcasters.amazon.com/podcasts/bbdd140b-db4a-443d-bac4-680e57d2dcd5',
              castbox: 'https://castbox.fm/channel/id5763464',
              castro: 'https://castbox.fm/channel/id5763464',
              google:
                'https://podcasts.google.com/feed/aHR0cHM6Ly93d3cuY2l0aXplbmNvc21vcy5zcGFjZS9yc3M',
              iheart: 'https://www.iheart.com/podcast/269-citizen-web3-77348233/',
              overcast: 'https://overcast.fm/itunes1510241147/',
              pocket: 'https://pca.st/g9vkfbgu',
              radioPublic: 'https://radiopublic.com/citizen-web3-GmyKQN',
              spotify: 'https://open.spotify.com/show/4pwsjBsgY1C5XCyRoslbSn',
              tunein: 'https://tunein.com/podcasts/Technology-Podcasts/Citizen-Web3-p1350473/',
            },
          },
        },
      },
      contacts: { data: 'CONTACTS' },
      general: {
        title: 'Useful Info',
        data: {
          description: [
            'ValidatorInfo is a multichain, validator-centric aggregator and explorer, and a future dashboard, that will allow users and validators to use their web3 wallets to login and interact with the application.',
            'Our goal is to help stakers, web3 users and any holder of a POS token to discover more information about the validators that are securing their favourite network, or - use our explorer to find the most relevent information one needs.',
            'Validator info is created by Citizen Web3.',
            'Citizen Web3, as a project started in 2020, finding roots in ancap vibes, personal values of building a better society, ecosystem development and networking. Today, Citizen Web3 is an active member of the web3 galaxy. We provide, non-custodial, infrastructure as a validator across the blockchain space, which allows us to work on various public goods projects and contribute to the development of web3.',
          ],
          section: [
            {
              title: 'Our Tools',
              isModal: true,
              textButton: 'Learn More',
              isRichText: true,
              richTextContent: '',
            },
            {
              title: 'Our Manifesto',
              isModal: true,
              textButton: 'Learn More',
              isRichText: true,
              richTextContent: '',
            },
          ],
        },
      },
    }
  },
})

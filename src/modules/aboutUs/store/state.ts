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
      partners: { data: 'PARTNERS' },
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
        data: [
          {
            label: 'Our mission',
            content:
              'Citizen Web3 was born out of years of community management and ecosystem development. Today, Citizen Web3 is a project providing infrastructure services as a validator across the blockchain space, one of the oldest web3 podcasts in the space and a community of like-minded people. Our flagship product, validatorinfo.com is a dashboard and an explorer that helps you to discover validators across the space.\n' +
              '\n' +
              'We believe that blockchains should be viewed as digital nations and by using the tools that we hold, we help to build and bring value to these nations. We monetize ourselves via our validators. If we believe that a city can be prosperous, and it meets our values, we start to work around it. In turn, the citizens of the city, read - blockchain users, delegate tokens to our validators, which helps us to keep going.\n' +
              'Our goals are much bigger. We strive and build to becoming the layer-0, i.e. - a community bridge between ecosystems. Running more nodes, creating more content, forming more partnerships, etc.',
          },
          {
            label: 'OUR TOOLS',
            content:
              '1) Web3-focused podcast, dedicated to the stories of the people that make dreams reality \n' +
              '2) validatorinfo.com: a dashboard and an explorer that helps you to discover validators across the web3 galaxy (in the making) \n' +
              '3) Web3 Society: a community that helps, learns and resents tribalism. Including various incentoves (NA at the moment)\n' +
              '4) Public infrastructure, including validator nodes, public RPC endpoints, various testnets. We are currently migrating to bare metal\n' +
              '5) (NA at the moment) Bazaar: NFTs (old collection), Merchandise, Decentraland',
          },
          {
            label: 'OUR MANIFESTO',
            content:
              'From this distant vantage point, the Earth might not seem of any particular interest. But for us, it\'s different. Consider again at that dot. That\'s here. That\'s home. That\'s us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization, every king and peasant, every young couple in love, every mother and father, hopeful child, inventor and explorer, every teacher of morals, every corrupt politician, every "superstar," every "supreme leader," every saint and sinner in the history of our species lived there--on a mote of dust suspended in a sunbeam... Our posturings, our imagined self-importance, the delusion that we have some privileged position in the Universe, are challenged by this point of pale light. Our planet is a lonely speck in the great enveloping cosmic dark. In our obscurity, in all this vastness, there is no hint that help will come from elsewhere to save us from ourselves...\n' +
              '\n' +
              "From 'A Pale Blue Dot', by Carl Sagan." +
              'We believe in freedom above needs. We believe in possibilities above enforcement. We believe in values above desires. We believe that censorship has killed more people than anything else together combined. We value honesty and we value the truth. We value love and cherish all existing creatures. We value intelligence and we value decentralization.\n' +
              '\n' +
              'We believe in communication, which allows participants to think, make their mind up and cast personal votes on any topic and subject. We think that content should strive to lack subjective opinions and help its consumers to form an opinion, which will result in better discussion, and in turn in a more efficient consensus.\n' +
              '\n' +
              'We believe that blockchains are not simply a form of digital nations. But, open and verifiable blockchains are somewhat similar to natural hives, forests, patterns in the nature that allow us to communicate better. Without communication, we are doomed, and decentralized consensus is a tool that can and will help those who desire to make our pale blue dot a slightly better place.\n' +
              '\n' +
              'AND MAY THE CODE BE WITH YOU!',
          },
        ],
      },
    }
  },
})

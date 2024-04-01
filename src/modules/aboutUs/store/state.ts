import { defineStore } from 'pinia'
import { AboutUsState } from './types'

export const useState = defineStore({
  id: 'aboutUsStore.state',
  state: (): AboutUsState => {
    return {
      staking: {
        title: 'Staking',
        data: {
          section: [
            {
              title: 'Dao stakes',
              textButton: 'Learn More',
            },
          ],
        },
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
              richTextContent:
                '<ul class="list-none py-15 px-8.5">\n' +
                '  <div class="flex flex-row items-center justify-between">\n' +
                '    <div>\n' +
                '      <p class="text-americanYellow text-h3">Our Tools</p>\n' +
                '    </div>\n' +
                '  </div>\n' +
                '  <li class="pt-2 text-h4">\n' +
                '    <span class="text-americanYellow">1. </span>\n' +
                '    <a href="https://www.citizenweb3.com/episodes"\n' +
                '    >Web3-focused podcast, dedicated to the stories of the people that make dreams\n' +
                '      reality</a\n' +
                '    >\n' +
                '  </li>\n' +
                '  <li class="pt-2 text-h4">\n' +
                '    <span class="text-americanYellow">2. </span>\n' +
                '    validatorinfo.com: a dashboard and an explorer that helps you to discover validators\n' +
                '    across the web3 galaxy\n' +
                '    <a href="https://github.com/citizenweb3/validatorinfo/tree/main">(in the making)</a>\n' +
                '  </li>\n' +
                '  <li class="pt-2 text-h4">\n' +
                '    <span class="text-americanYellow">3. </span>\n' +
                '    <a href="https://t.me/web_3_society">Web3 Society</a>: a community that helps, learns\n' +
                '    and resents tribalism. Including various incentoves (NA at the moment)\n' +
                '  </li>\n' +
                '  <li class="pt-2 text-h4">\n' +
                '    <span class="text-americanYellow">4. </span>\n' +
                '    Public infrastructure, including\n' +
                '    <a href="https://www.citizenweb3.com/staking">validator nodes</a>, public RPC endpoints,\n' +
                '    various testnets. We are currently migrating to bare metal\n' +
                '  </li>\n' +
                '  <li class="pt-2 text-h4">\n' +
                '    <span class="text-americanYellow">5. </span>(NA at the moment) Bazaar: NFTs\n' +
                '    <a href="https://www.citizenweb3.com/nft">(old collection)</a>, Merchandise,\n' +
                '    Decentraland\n' +
                '  </li>\n' +
                '</ul>',
            },
            {
              title: 'Our Manifesto',
              isModal: true,
              textButton: 'Learn More',
              isRichText: true,
              richTextContent:
                '<div>\n' +
                '          <p class="text-americanYellow text-h3">Our Manifesto</p>\n' +
                '          <div class="ml-9">\n' +
                '            <p class="text-white">\n' +
                '              From this distant vantage point, the Earth might not seem of any particular interest.\n' +
                "              But for us, it's different. Consider again at that dot. That's here. That's home.\n" +
                "              That's us. On it everyone you love, everyone you know, everyone you ever heard of,\n" +
                '              every human being who ever was, lived out their lives. The aggregate of our joy and\n' +
                '              suffering, thousands of confident religions, ideologies, and economic doctrines, every\n' +
                '              hunter and forager, every hero and coward, every creator and destroyer of\n' +
                '              civilization, every king and peasant, every young couple in love, every mother and\n' +
                '              father, hopeful child, inventor and explorer, every teacher of morals, every corrupt\n' +
                '              politician, every "superstar," every "supreme leader," every saint and sinner in the\n' +
                '              history of our species lived there--on a mote of dust suspended in a sunbeam... Our\n' +
                '              posturings, our imagined self-importance, the delusion that we have some privileged\n' +
                '              position in the Universe, are challenged by this point of pale light. Our planet is a\n' +
                '              lonely speck in the great enveloping cosmic dark. In our obscurity, in all this\n' +
                '              vastness, there is no hint that help will come from elsewhere to save us from\n' +
                '              ourselves...\n' +
                '            </p>\n' +
                '            <p class="text-white mt-10">From \'A Pale Blue Dot\', by Carl Sagan.</p>\n' +
                '          </div>\n' +
                '          <div>\n' +
                '            <p class="text-white">\n' +
                '              We believe in freedom above needs. We believe in possibilities above enforcement. We\n' +
                '              believe in values above desires. We believe that censorship has killed more people\n' +
                '              than anything else together combined. We value honesty and we value the truth. We\n' +
                '              value love and cherish all existing creatures. We value intelligence and we value\n' +
                '              decentralization.\n' +
                '            </p>\n' +
                '            <p class="text-white mt-5">\n' +
                '              We believe in communication, which allows participants to think, make their mind up\n' +
                '              and cast personal votes on any topic and subject. We think that content should strive\n' +
                '              to lack subjective opinions and help its consumers to form an opinion, which will\n' +
                '              result in better discussion, and in turn in a more efficient consensus.\n' +
                '            </p>\n' +
                '            <p class="text-white mt-5">\n' +
                '              We believe that blockchains are not simply a form of digital nations. But, open and\n' +
                '              verifiable blockchains are somewhat similar to natural hives, forests, patterns in the\n' +
                '              nature that allow us to communicate better. Without communication, we are doomed, and\n' +
                '              decentralized consensus is a tool that can and will help those who desire to make our\n' +
                '              pale blue dot a slightly better place.\n' +
                '            </p>\n' +
                '            <p class="text-white mt-5">AND MAY THE CODE BE WITH YOU!</p>\n' +
                '          </div>\n' +
                '        </div>',
            },
          ],
        },
      },
    }
  },
})

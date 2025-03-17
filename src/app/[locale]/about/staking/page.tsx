import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';
import Link from 'next/link';

export default function StakingPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('AboutPage');

  return (
    <div>
      <Story src="staking" alt="Pixelated, 90s game-style characters stake on validator and mining pool rewards" />
      <TabList page="AboutPage" tabs={aboutTabs} />
      <PageTitle text={t('Staking.title')} />
      <div>
        <div className="flex flex-col items-center py-4">
          <div className="m-4 whitespace-pre-line text-base">
            {t.rich('Staking.description', {
              horcrux: (text) => (
                <TextLink target="_blank" href="https://github.com/strangelove-ventures/horcrux" content={text} />
              ),
              restake: (text) => <TextLink target="_blank" href="https://restake.app/" content={text} />,
            })}
          </div>
          <SubDescription text={t('Staking.descriptionExtended')} />
        </div>
        <SubTitle text="Networks" size="h2" />
        <div className="grid grid-cols-4 gap-4 py-4">
          {data.map((item, index) => (
            <div key={index} className="flex justify-between bg-card bg-left">
              <div className="relative flex h-40 w-48 flex-col bg-[url('/img/staking-bg.png')] bg-cover">
                <div className="-ml-1 -mt-7 flex flex-grow items-center justify-center">
                  {item.icon && (
                    <Link href={`https://staking.citizenweb3.com/chains/${item.stakingName}`} target={`_blank`}>
                      <Image src={item.icon} alt={item.name} width={80} height={80}
                             className="h-20 w-20 rounded-full" />
                    </Link>
                  )}
                </div>
                <div className="absolute bottom-1 left-2 text-nowrap text-lg tracking-[0.25rem] text-shadow-sm">
                  {item.name}
                </div>
              </div>
              <div className="flex flex-col items-end justify-center pr-4">
                {item.delegate && (
                  <RoundedButton href={item.delegate} contentClassName="text-xl font-bold" target="_blank">
                    Stake
                  </RoundedButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const data: {
  name: string;
  icon?: string;
  delegate?: string;
  stakingName?: string;
}[] = [
  {
    name: 'Cosmos hub',
    icon: '/img/icons/chains/atom.png',
    delegate:
      'https://wallet.keplr.app/chains/cosmos-hub?modal=validator&chain=cosmoshub-4&validator_address=cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u&referral=true',
    stakingName: 'cosmoshub',
  },
  {
    name: 'Atom One',
    icon: '/img/icons/chains/atomone.svg',
    delegate: 'https://explorer.allinbits.services/atomone/staking/atonevaloper1e859xaue4k2jzqw20cv6l7p3tmc378pcclyn60',
    stakingName: 'atomone',
  },
  {
    name: 'Celestia',
    icon: '/img/icons/chains/celestia.png',
    delegate:
      'https://wallet.keplr.app/chains/celestia?modal=validator&chain=celestia&validator_address=celestiavaloper1m77eksxfz9q50qejnqf720sns7q0xtx8uzxnhs',
    stakingName: 'celestia',
  },
  {
    name: 'LikeCoin',
    icon: '/img/icons/chains/like.png',
    delegate:
      'https://wallet.keplr.app/?modal=staking&chain=likecoin-mainnet-2&validator_address=likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu&step_id=3&action_id=stake',
    stakingName: 'likecoin',
  },
  {
    name: 'Cyber/Bostrom',
    icon: '/img/icons/chains/boot.png',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    stakingName: 'bostrom',
  },
  {
    name: 'Gravity Bridge',
    icon: '/img/icons/chains/grav.png',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    stakingName: 'gravitybridge',
  },
  {
    name: 'QuickSilver',
    icon: '/img/icons/chains/qck.png',
    delegate: 'https://quicksilver.explorers.guru/validator/quickvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8a7t9vq',
    stakingName: 'quicksilver',
  },
  {
    name: 'GoVGen',
    icon: '/img/icons/chains/govgen.png',
    delegate: 'https://explorer.govgen.io/govgen/staking/govgenvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8pv6wce',
    stakingName: 'govgen',
  },
  {
    name: 'Uptick',
    icon: '/img/icons/chains/uptick.png',
    delegate: 'https://uptick.explorers.guru/validator/uptickvaloper1ke3qlvuhcn537m47l3y3hj0v7jm48ka47nkduu',
    stakingName: 'uptick',
  },
  {
    name: 'Neutron',
    icon: '/img/icons/chains/neutron.png',
    stakingName: 'neutron',
  },
  {
    name: 'Stride',
    icon: '/img/icons/chains/strd.png',
    delegate: 'https://explorer.stride.zone/stride/staking/stridevaloper1m77eksxfz9q50qejnqf720sns7q0xtx8gf36rj',
    stakingName: 'stride',
  },
  {
    name: 'Interlay',
    icon: '/img/icons/chains/interlay.svg',
    delegate: 'https://app.interlay.io/vaults/wd7mvsKzX8QaGh268wiqCpu8j7z5pAZhw1VUkcJPxwtNY14jb/DOT/IBTC',
    stakingName: 'interlay',
  },
  {
    name: 'Althea',
    icon: '/img/icons/chains/althea.png',
    delegate: 'https://www.mintscan.io/althea/validators/altheavaloper1m77eksxfz9q50qejnqf720sns7q0xtx8c4r6fm',
    stakingName: 'althea',
  },
  {
    name: 'Stakenet Nomic',
    icon: '/img/icons/chains/nom.png',
    delegate: 'https://nomic-explorer.quokkastake.io/nomic/staking/nomic1mk05ju8jq0mxzx3kfr0wcct8an2htjh53m4yk5',
    stakingName: 'nomic',
  },
  {
    name: 'Namada',
    icon: '/img/icons/chains/nam.png',
    delegate: 'https://namadillo.citizenweb3.com/staking',
    stakingName: 'namada',
  },
  {
    name: 'Testnet Namada',
    icon: '/img/icons/chains/nam.png',
    delegate: 'https://namadillo-housefire.citizenweb3.com/',
    stakingName: 'namadatestnet',
  },
  {
    name: 'Testnet Union',
    icon: '/img/icons/chains/union.svg',
    delegate: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
    stakingName: 'union',
  },
  {
    name: 'Testnet Symphony',
    icon: '/img/icons/chains/symphony.png',
    delegate: 'https://testnet.ping.pub/symphony/staking/symphonyvaloper1wpzkum4902l3978qyl24469ktlmt58u9yy9nsa',
    stakingName: 'symphony',
  },
  {
    name: 'Testnet Neutron',
    icon: '/img/icons/chains/neutron.png',
    stakingName: 'neutrontestnet',
  },
  {
    name: 'Testnet Axone',
    icon: '/img/icons/chains/axone.svg',
    delegate: 'https://explore.axone.xyz/Axone%20testnet/staking/axonevaloper1c3yfkydn9quv9ns6mkfrcgg489nrlwxd88yu9s',
    stakingName: 'axone',
  },
  {
    name: 'Testnet Nillion',
    icon: '/img/icons/chains/nillion.svg',
    delegate: 'https://testnet.nillion.explorers.guru/validator/nillionvaloper1xhk9ux9y6w0gc3rtc8ksx2gf37mageegadjrp6',
    stakingName: 'nillion',
  },
  {
    name: 'Testnet Artela',
    icon: '/img/icons/chains/artela.svg',
    delegate: 'https://testnet.artela.explorers.guru/validator/artvaloper1mtmuvpra48uwgdht6wj4pnwp5d89xsc9aadfup',
    stakingName: 'artela',
  },
  {
    name: 'Testnet Cosmos',
    icon: '/img/icons/chains/atom.png',
    delegate: 'https://explorer.polypore.xyz/provider/staking/cosmosvaloper18lz3nz3nyhtewm35npaccnc7javzmyvfake7j7',
    stakingName: 'cosmostestnet',
  },
  {
    name: 'Bitcoin',
    icon: '/img/icons/chains/bitcoin.svg',
    stakingName: 'bitcoin',
  },
  {
    name: 'Citrea',
    icon: '/img/icons/chains/citrea.svg',
    stakingName: 'citrea',
  },
  {
    name: 'Testnet Quicksilver',
    icon: '/img/icons/chains/qck.png',
    delegate: 'https://testnet-explorer.konsortech.xyz/quicksilver/staking/quickvaloper1pd6yhpkt557d85mwdmvgt0mxpcc24kv7w0xh8n',
    stakingName: 'quicksilvertestnet',
  },
];

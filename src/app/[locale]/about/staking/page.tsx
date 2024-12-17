import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';

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
        <div className="flex flex-row flex-wrap py-4">
          {data.map((item, index) => (
            <div key={index} className="m-4 w-60 bg-card">
              <div>
                <div className="relative">
                  <div className="absolute left-0 right-0 top-0 px-3 py-1 text-center text-lg">{item.name}</div>
                  <div className="flex h-40 w-60 items-center justify-center bg-[url('/img/staking-bg.png')] bg-cover">
                    {item.icon && (
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="mt-8 h-[6.5rem] w-[6.5rem]"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center px-8 pb-3.5 pt-6">
                {item.delegate && (
                  <RoundedButton href={item.delegate} contentClassName="text-lg">
                    Stake
                  </RoundedButton>
                )}
                <RoundedButton
                  href={`https://staking.citizenweb3.com/chains/${item.name}`}
                  contentClassName="text-nowrap text-base"
                  className="mt-4"
                >
                  Infra & Tools
                </RoundedButton>
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
    name: 'Evmos',
    icon: '/img/icons/chains/evmos.png',
    delegate:
      'https://wallet.keplr.app/chains/evmos?modal=validator&chain=evmos_9001-2&validator_address=evmosvaloper1mtwvpdd57gpkyejd566s24afr9zm5ryq8gwpvj&referral=true',
    stakingName: 'evmos',
  },
  {
    name: 'LikeCoin',
    icon: '/img/icons/chains/like.png',
    delegate:
      'https://wallet.keplr.app/?modal=staking&chain=likecoin-mainnet-2&validator_address=likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu&step_id=3&action_id=stake',
    stakingName: 'likecoin',
  },
  {
    name: 'BitCanna',
    icon: '/img/icons/chains/bcna.png',
    delegate: 'https://wallet.bitcanna.io/validators/bcnavaloper1ngt4atd3qlgcwfv7fkjdjxhz7k0vl2rejrvzye',
    stakingName: 'bitcanna',
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
    name: 'Dymension',
    icon: '/img/icons/chains/dymension-logo.png',
    delegate: 'https://portal.dymension.xyz/dymension/staking',
    stakingName: 'dymension',
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
    // delegate: 'https://app.interlay.io/vaults/wd7mvsKzX8QaGh268wiqCpu8j7z5pAZhw1VUkcJPxwtNY14jb/DOT/IBTC',
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
    delegate: 'https://app.nomic.io/staking?validator=nomic1mk05ju8jq0mxzx3kfr0wcct8an2htjh53m4yk5&modal=info',
    stakingName: 'nomic',
  },
  {
    name: 'Namada',
    icon: '/img/icons/chains/nam.png',
    delegate: 'https://shielded.live/validators/D4ADFBD41E607C7ADFEDE6DDAB53383A9D525EF9C7E70A742F48803A6D1EA4F8',
    stakingName: 'namada',
  },
  {
    name: 'Testnet Namada',
    icon: '/img/icons/chains/nam.png',
    delegate: 'https://shielded.live/validators/D4ADFBD41E607C7ADFEDE6DDAB53383A9D525EF9C7E70A742F48803A6D1EA4F8',
    stakingName: 'namadatestnet',
  },
  {
    name: 'Testnet Soarchain',
    icon: '/img/icons/chains/soarchain.png',
    delegate: 'https://explorer.soarchain.com/soar/staking/soarvaloper1z66ujcpjxppue2u4pflwhakh0he4qup63586cx',
    stakingName: 'soarchain',
  },
  {
    name: 'Testnet SpacePussy',
    icon: '/img/icons/chains/spacepussy.png',
    delegate: 'https://spacepussy.ai/network/bostrom/hero/pussyvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqhfj9et',
    stakingName: 'pussy',
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
];

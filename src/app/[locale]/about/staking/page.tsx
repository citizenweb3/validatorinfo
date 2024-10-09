import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import CheckMark from '@/app/about/staking/check-mark';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import TextLink from '@/components/common/text-link';
import { Locale } from '@/i18n';

export default function StakingPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('AboutPage');

  return (
    <div>
      <SubTitle text={t('Staking.title')} />
      <div className="flex flex-row items-center border-b border-bgSt py-4">
        <div className="mt-4 whitespace-pre-line text-base">
          {t.rich('Staking.description', {
            horcrux: (text) => (
              <TextLink target="_blank" href="https://github.com/strangelove-ventures/horcrux" content={text} />
            ),
            restake: (text) => <TextLink target="_blank" href="https://restake.app/" content={text} />,
          })}
        </div>
      </div>
      <SubTitle text="Networks" size="h2" />
      <div className="flex flex-row py-4">
        <table className="w-full">
          <thead>
            <tr>
              <th>Network</th>
              <th>Delegate</th>
              <th>Endpoints</th>
              <th>Seeds</th>
              <th>Relayers</th>
              <th>Snapshot</th>
              <th>Archive</th>
              <th>Others</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-black">
                <td className="h-16 text-base">
                  <div className="flex h-full items-center px-2.5">
                    <div className="mr-2 w-10">
                      {item.icon && (
                        <Image src={item.icon} alt={item.name} width={40} height={40} className="h-10 w-auto" />
                      )}
                    </div>
                    <div>{item.name}</div>
                  </div>
                </td>
                <td className="pb-3.5 pt-6 text-center">
                  {item.delegate && <RoundedButton href={item.delegate}>Stake</RoundedButton>}
                </td>
                <td className="text-center">{item.endpoints && <CheckMark />}</td>
                <td className="text-center">{item.seeds && <CheckMark />}</td>
                <td className="text-center"></td>
                <td className="text-center">{item.snapshot && <CheckMark />}</td>
                <td className="text-center">{item.archive && <CheckMark />}</td>
                <td className="text-center">{item.additions?.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const data: {
  name: string;
  icon?: string;
  delegate?: string;
  endpoints: boolean;
  seeds: boolean;
  relayers: string;
  snapshot: boolean;
  archive: boolean;
  additions?: string[];
}[] = [
  {
    name: 'Cosmos hub',
    icon: '/img/icons/chains/atom.png',
    delegate:
      'https://wallet.keplr.app/chains/cosmos-hub?modal=validator&chain=cosmoshub-4&validator_address=cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u&referral=true',
    endpoints: true,
    seeds: false,
    relayers: 'CosmosHub <-> Stride',
    snapshot: false,
    archive: false,
    additions: ['Running since 2019', 'Running Testnet'],
  },
  {
    name: 'Celestia',
    icon: '/img/icons/chains/celestia.png',
    delegate:
      'https://wallet.keplr.app/chains/celestia?modal=validator&chain=celestia&validator_address=celestiavaloper1m77eksxfz9q50qejnqf720sns7q0xtx8uzxnhs',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis RPC Provider', 'Running Testnet'],
  },
  {
    name: 'Evmos',
    icon: '/img/icons/chains/evmos.png',
    delegate:
      'https://wallet.keplr.app/chains/evmos?modal=validator&chain=evmos_9001-2&validator_address=evmosvaloper1mtwvpdd57gpkyejd566s24afr9zm5ryq8gwpvj&referral=true',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Genesis Validator'],
  },
  {
    name: 'LikeCoin',
    icon: '/img/icons/chains/like.png',
    delegate:
      'https://wallet.keplr.app/chains/likecoin?modal=validator&chain=likecoin-mainnet-2&validator_address=likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'BitCanna',
    icon: '/img/icons/chains/bcna.png',
    delegate: 'https://wallet.bitcanna.io/validators/bcnavaloper1ngt4atd3qlgcwfv7fkjdjxhz7k0vl2rejrvzye',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Cyber/Bostrom',
    icon: '/img/icons/chains/boot.png',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis & Genesis Validator'],
  },
  {
    name: 'Gravity Bridge',
    icon: '/img/icons/chains/grav.png',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Composable',
    icon: '/img/icons/chains/pica.svg',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Dymension',
    icon: '/img/icons/chains/dymension-logo.png',
    delegate: 'https://portal.dymension.xyz/dymension/staking',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis & Genesis Validator'],
  },
  {
    name: 'QuickSilver',
    icon: '/img/icons/chains/qck.png',
    delegate: 'https://quicksilver.explorers.guru/validator/quickvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8a7t9vq',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'GoVGen',
    icon: '/img/icons/chains/govgen.png',
    delegate: 'https://explorer.govgen.io/govgen/staking/govgenvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8pv6wce',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis Validator. Governance-only chain'],
  },
  {
    name: 'Uptick',
    icon: '/img/icons/chains/uptick.png',
    delegate: 'https://uptick.explorers.guru/validator/uptickvaloper1ke3qlvuhcn537m47l3y3hj0v7jm48ka47nkduu',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Neutron',
    icon: '/img/icons/chains/neutron.png',
    // delegate: 'https://app.interlay.io/vaults/wd7mvsKzX8QaGh268wiqCpu8j7z5pAZhw1VUkcJPxwtNY14jb/DOT/IBTC',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Genesis Validator', 'Running Testnet'],
  },
  {
    name: 'Stride',
    icon: '/img/icons/chains/strd.png',
    // delegate: 'https://www.mintscan.io/stride/ics-validators/cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Genesis Validator', 'Running Governor'],
  },
  {
    name: 'Nomic',
    icon: '/img/icons/chains/nom.png',
    delegate: 'https://app.nomic.io/staking?validator=nomic1mk05ju8jq0mxzx3kfr0wcct8an2htjh53m4yk5&modal=info',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Stakenet'],
  },
  {
    name: 'Namada',
    icon: '/img/icons/chains/nam.png',
    delegate: 'https://shielded.live/validators/D4ADFBD41E607C7ADFEDE6DDAB53383A9D525EF9C7E70A742F48803A6D1EA4F8',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis validator (Shielded Expedition)'],
  },
  {
    name: 'Soarchain',
    icon: '/img/icons/chains/soarchain.png',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis validator'],
  },
  {
    name: 'SpacePussy',
    icon: '/img/icons/chains/spacepussy.png',
    delegate: 'https://spacepussy.ai/network/bostrom/hero/pussyvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqhfj9et',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Union',
    icon: '/img/icons/chains/union.svg',
    delegate: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Althea',
    icon: '/img/icons/chains/althea.png',
    delegate: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis validator - HALTED'],
  },
  {
    name: 'Symphony',
    icon: '/img/icons/chains/symphony.png',
    delegate: 'https://testnet.ping.pub/symphony/staking/symphonyvaloper1wpzkum4902l3978qyl24469ktlmt58u9yy9nsa',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis Validator'],
  },
  {
    name: 'Testnet Neutron',
    icon: '/img/icons/chains/neutron.png',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Test Network'],
  },
  {
    name: 'Testnet Cosmos',
    icon: '/img/icons/chains/atom.png',
    endpoints: false,
    seeds: false,
    relayers: '-',
    snapshot: false,
    archive: false,
    additions: ['Test Network'],
  },
];

/*


  { name: 'BitCanna', rpc: 'https://rpc.bitcanna.citizenweb3.com/', api: 'https://api.bitcanna.citizenweb3.com/' },
  { name: 'LikeCoin', rpc: 'https://rpc.likecoin.citizenweb3.com/', api: 'https://api.likecoin.citizenweb3.com/' },
  {
    name: 'CosmosHub',
    rpc: 'https://rpc.cosmoshub-4.citizenweb3.com/',
    api: 'https://api.cosmoshub-4.citizenweb3.com/',
  },
  { name: 'Evmos', rpc: 'https://rpc.evmos.citizenweb3.com/', api: 'https://api.evmos.citizenweb3.com/' },
  { name: 'Celestia', rpc: 'https://rpc.celestia.citizenweb3.com/', api: 'https://api.celestia.citizenweb3.com/' },
  {
    name: 'Composable',
    rpc: 'https://rpc.composable.citizenweb3.com/',
    api: 'https://api.composable.citizenweb3.com/',
  },
  { name: 'Stride', rpc: 'https://rpc.stride.citizenweb3.com/', api: 'https://api.stride.citizenweb3.com/' },
  { name: 'Neutron', rpc: 'https://rpc.neutron.citizenweb3.com/', api: 'https://api.neutron.citizenweb3.com/' },

* */

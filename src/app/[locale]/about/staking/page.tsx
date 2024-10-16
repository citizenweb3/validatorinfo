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
            <tr className="bg-table_header text-sm">
              <th className="py-3">Network</th>
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
                <td className="text-center">{!!item.endpoints.length && <CheckMark data={item.endpoints} />}</td>
                <td className="text-center">{!!item.seeds.length && <CheckMark data={item.seeds} copy />}</td>
                <td className="text-center">{item.relayers}</td>
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
  endpoints: { name: string; href: string }[];
  seeds: { name: string; href: string }[];
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
    endpoints: [
      { name: 'rpc', href: 'https://rpc.cosmoshub-4.citizenweb3.com' },
      { name: 'api', href: 'https://api.cosmoshub-4.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.cosmoshub-4.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://api.cosmoshub-4.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: 'd567c93fa5b646c8cca8ba0a2d7499bca6aeba52@mainnet.seednode.citizenweb3.com:26656' },
      { name: 'peer', href: 'd567c93fa5b646c8cca8ba0a2d7499bca6aeba52@78.46.79.242:26656' },
    ],
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
    endpoints: [
      { name: 'rpc', href: 'https://rpc.celestia.citizenweb3.com' },
      { name: 'api', href: 'https://api.celestia.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.celestia.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.celestia.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '7066852273cf94ec60003b40428010a4eac86f5b@mainnet.seednode.citizenweb3.com:27656' },
      { name: 'peer', href: '7066852273cf94ec60003b40428010a4eac86f5b@78.46.79.242:27656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis RPC Provider', 'Running Testnet'],
  },
  {
    name: 'Evmos',
    icon: '/img/icons/chains/evmos.png',
    delegate:
      'https://wallet.keplr.app/chains/evmos?modal=validator&chain=evmos_9001-2&validator_address=evmosvaloper1mtwvpdd57gpkyejd566s24afr9zm5ryq8gwpvj&referral=true',
    endpoints: [],
    seeds: [],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Genesis Validator'],
  },
  {
    name: 'LikeCoin',
    icon: '/img/icons/chains/like.png',
    delegate:
      'https://wallet.keplr.app/chains/likecoin?modal=validator&chain=likecoin-mainnet-2&validator_address=likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.likecoin.citizenweb3.com' },
      { name: 'api', href: 'https://api.likecoin.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.likecoin.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.likecoin.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: 'c46842036cfd8b956f0969e25f0a6599ad98e2a9@mainnet.seednode.citizenweb3.com:33656' },
      { name: 'peer', href: 'c46842036cfd8b956f0969e25f0a6599ad98e2a9@78.46.79.242:33656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
  },
  {
    name: 'BitCanna',
    icon: '/img/icons/chains/bcna.png',
    delegate: 'https://wallet.bitcanna.io/validators/bcnavaloper1ngt4atd3qlgcwfv7fkjdjxhz7k0vl2rejrvzye',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.bitcanna.citizenweb3.com' },
      { name: 'api', href: 'https://api.bitcanna.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.bitcanna.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.bitcanna.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: 'c098c53e76d204cd843cec99855cf7febe4277bf@mainnet.seednode.citizenweb3.com:32656' },
      { name: 'peer', href: 'c098c53e76d204cd843cec99855cf7febe4277bf@78.46.79.242:32656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Cyber/Bostrom',
    icon: '/img/icons/chains/boot.png',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    endpoints: [],
    seeds: [],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis & Genesis Validator'],
  },
  {
    name: 'Gravity Bridge',
    icon: '/img/icons/chains/grav.png',
    delegate:
      'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.gravity.citizenweb3.com' },
      { name: 'api', href: 'https://api.gravity.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.gravity.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.gravity.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: 'cba79db1bb3a5438fb293da0a627a8450f053941@mainnet.seednode.citizenweb3.com:34656' },
      { name: 'peer', href: 'cba79db1bb3a5438fb293da0a627a8450f053941@78.46.79.242:34656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Dymension',
    icon: '/img/icons/chains/dymension-logo.png',
    delegate: 'https://portal.dymension.xyz/dymension/staking',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.dym.citizenweb3.com' },
      { name: 'api', href: 'https://api.dym.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.dym.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.dym.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '8679333e027be05116c388c040d7c45ca1aeeeeb@mainnet.seednode.citizenweb3.com:14656' },
      { name: 'peer', href: '8679333e027be05116c388c040d7c45ca1aeeeeb@78.46.79.242:14656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis & Genesis Validator'],
  },
  {
    name: 'QuickSilver',
    icon: '/img/icons/chains/qck.png',
    delegate: 'https://quicksilver.explorers.guru/validator/quickvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8a7t9vq',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.quicksilver.citizenweb3.com' },
      { name: 'api', href: 'https://api.quicksilver.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.quicksilver.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.quicksilver.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '719ddc260d5bbd17a7c6ed4219bdbad60d423d96@mainnet.seednode.citizenweb3.com:28656' },
      { name: 'peer', href: '719ddc260d5bbd17a7c6ed4219bdbad60d423d96@78.46.79.242:28656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
  },
  {
    name: 'GoVGen',
    icon: '/img/icons/chains/govgen.png',
    delegate: 'https://explorer.govgen.io/govgen/staking/govgenvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8pv6wce',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.govgen.citizenweb3.com' },
      { name: 'api', href: 'https://api.govgen.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.govgen.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.govgen.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '75bb6414e108294ea185bf499552112c6d7c076f@mainnet.seednode.citizenweb3.com:35656' },
      { name: 'peer', href: '75bb6414e108294ea185bf499552112c6d7c076f@78.46.79.242:35656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis Validator. Governance-only chain'],
  },
  {
    name: 'Uptick',
    icon: '/img/icons/chains/uptick.png',
    delegate: 'https://uptick.explorers.guru/validator/uptickvaloper1ke3qlvuhcn537m47l3y3hj0v7jm48ka47nkduu',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.uptick.citizenweb3.com' },
      { name: 'api', href: 'https://api.uptick.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.uptick.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.uptick.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: 'bddaa78825892bde04b5aa8f28b95a072a50eaf9@mainnet.seednode.citizenweb3.com:29656' },
      { name: 'peer', href: 'bddaa78825892bde04b5aa8f28b95a072a50eaf9@78.46.79.242:29656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
  },
  {
    name: 'Neutron',
    icon: '/img/icons/chains/neutron.png',
    // delegate: 'https://app.interlay.io/vaults/wd7mvsKzX8QaGh268wiqCpu8j7z5pAZhw1VUkcJPxwtNY14jb/DOT/IBTC',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.neutron.citizenweb3.com' },
      { name: 'api', href: 'https://api.neutron.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.neutron.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.neutron.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '1020d1490712fe3e669658e506b46a5974a430fc@mainnet.seednode.citizenweb3.com:31656' },
      { name: 'peer', href: '1020d1490712fe3e669658e506b46a5974a430fc@78.46.79.242:31656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Genesis Validator', 'Running Testnet'],
  },
  {
    name: 'Stride',
    icon: '/img/icons/chains/strd.png',
    delegate: 'https://explorer.stride.zone/stride/staking/stridevaloper1m77eksxfz9q50qejnqf720sns7q0xtx8gf36rj',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.stride.citizenweb3.com' },
      { name: 'api', href: 'https://api.stride.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.stride.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.strdie.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: 'aab3f03bfb030244e018f20681b2ac6b9ad0d0f7@mainnet.seednode.citizenweb3.com:30656' },
      { name: 'peer', href: 'aab3f03bfb030244e018f20681b2ac6b9ad0d0f7@78.46.79.242:30656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Genesis Validator', 'Running Governor'],
  },
  {
    name: 'Althea',
    icon: '/img/icons/chains/althea.png',
    // delegate: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.althea.citizenweb3.com' },
      { name: 'api', href: 'https://api.althea.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.althea.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.althea.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '7955b5233d4efe3506900422f1bcd58521be1377@mainnet.seednode.citizenweb3.com:36656' },
      { name: 'peer', href: '7955b5233d4efe3506900422f1bcd58521be1377@78.46.79.242:36656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis validator - HALTED', 'Test Network'],
  },
  {
    name: 'Stakenet Nomic',
    icon: '/img/icons/chains/nom.png',
    delegate: 'https://app.nomic.io/staking?validator=nomic1mk05ju8jq0mxzx3kfr0wcct8an2htjh53m4yk5&modal=info',
    endpoints: [],
    seeds: [],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Stakenet'],
  },
  {
    name: 'Testnet Namada',
    icon: '/img/icons/chains/nam.png',
    delegate: 'https://shielded.live/validators/D4ADFBD41E607C7ADFEDE6DDAB53383A9D525EF9C7E70A742F48803A6D1EA4F8',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.namada-housefire.citizenweb3.com/' },
      { name: 'indexer', href: 'https://indexer.namada-housefire.citizenweb3.com/v3' },
    ],
    seeds: [
      { name: 'seed', href: 'tcp://fb6f004f247913b248e71f405f11f2e1c785ce08@@testnet.seednode:31656' },
      { name: 'peer', href: 'tcp://fb6f004f247913b248e71f405f11f2e1c785ce08@168.119.37.164:31656' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis validator (Shielded Expedition)', 'Test Network'],
  },
  {
    name: 'Testnet Soarchain',
    icon: '/img/icons/chains/soarchain.png',
    delegate: 'https://explorer.soarchain.com/soar/staking/soarvaloper1z66ujcpjxppue2u4pflwhakh0he4qup63586cx',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.soar-testnet.citizenweb3.com' },
      { name: 'api', href: 'https://api.soar-testnet.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.soar-testnet.citizenweb3.com' },
      { name: 'webrpc', href: 'https://api.soar-testnet.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '9d32c4a13a64f1a77c0f6b32138a3b745580cd8a@testnet.seednode.citizenweb3.com:17256' },
      { name: 'peer', href: '9d32c4a13a64f1a77c0f6b32138a3b745580cd8a@78.46.79.242:17256' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis validator', 'Test Network'],
  },
  {
    name: 'Testnet SpacePussy',
    icon: '/img/icons/chains/spacepussy.png',
    delegate: 'https://spacepussy.ai/network/bostrom/hero/pussyvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqhfj9et',
    endpoints: [],
    seeds: [],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Test Network'],
  },
  {
    name: 'Testnet Union',
    icon: '/img/icons/chains/union.svg',
    delegate: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.union-testnet.citizenweb3.com' },
      { name: 'api', href: 'https://api.union-testnet.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.union-testnet.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://api.union-testnet.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '6638ffb8127647f02c5df37079a6dd5593659149@testnet.seednode:17156' },
      { name: 'peer', href: '6638ffb8127647f02c5df37079a6dd5593659149@168.119.37.164:17156' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Test Network'],
  },
  {
    name: 'Testnet Symphony',
    icon: '/img/icons/chains/symphony.png',
    delegate: 'https://testnet.ping.pub/symphony/staking/symphonyvaloper1wpzkum4902l3978qyl24469ktlmt58u9yy9nsa',
    endpoints: [
      { name: 'rpc', href: 'https://rpc.symphony-testnet.citizenweb3.com' },
      { name: 'api', href: 'https://api.symphony-testnet.citizenweb3.com' },
      { name: 'grpc', href: 'https://grpc.symphony-testnet.citizenweb3.com' },
      { name: 'grpcweb', href: 'https://grpcweb.symphony-testnet.citizenweb3.com' },
    ],
    seeds: [
      { name: 'seed', href: '3bad680d3eebdf0e9168ad5802e2611c95eab124@testnet.seednode:27056' },
      { name: 'peer', href: '3bad680d3eebdf0e9168ad5802e2611c95eab124@168.119.37.164:27056' },
    ],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Pre-Genesis Validator', 'Test Network'],
  },
  {
    name: 'Testnet Neutron',
    icon: '/img/icons/chains/neutron.png',
    endpoints: [],
    seeds: [],
    relayers: '',
    snapshot: false,
    archive: false,
    additions: ['Test Network'],
  },
  {
    name: 'Testnet Cosmos',
    icon: '/img/icons/chains/atom.png',
    delegate: 'https://explorer.polypore.xyz/provider/staking/cosmosvaloper18lz3nz3nyhtewm35npaccnc7javzmyvfake7j7',
    endpoints: [],
    seeds: [],
    relayers: '',
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

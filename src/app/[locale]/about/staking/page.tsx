import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

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
        <div className="ml-6 font-handjet text-[6rem] text-[#F20000]">?</div>
        <div className="ml-6 mt-4 whitespace-pre-line text-base">
          {t.rich('Staking.description', {
            horcrux: (text) => (
              <TextLink target="_blank" href="https://github.com/strangelove-ventures/horcrux" content={text} />
            ),
            restake: (text) => <TextLink target="_blank" href="https://restake.app/" content={text} />,
            planned: (text) => (
              <TextLink target="_blank" href="https://github.com/citizenweb3/super-pancake/issues" content={text} />
            ),
            mission: (text) => <TextLink target="_blank" href="https://github.com/citizenweb3#tldr" content={text} />,
          })}
        </div>
      </div>
      <SubTitle text="Networks" size="h2" />
      <div className="flex flex-row py-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1">
            {Object.keys(item).map((title) => (
              <div key={title} className="mx-6 my-4 text-base">
                <div className="text-lg text-highlight">{title}:</div>
                <ul className="ml-4 mt-6 list-disc">
                  {item[title].map(({ name, link, stake, info, rpc, api, additions }) => (
                    <li key={name}>
                      {link ? <TextLink href={link} target="_blank" content={name} /> : name}
                      {stake && (
                        <>
                          <span className="px-2">|</span>
                          <TextLink content="Stake" href={stake} target="_blank" />
                        </>
                      )}
                      {info && (
                        <>
                          <span className="px-2">|</span>
                          <TextLink href={info} target="_blank" content="Info" />
                        </>
                      )}

                      {rpc && (
                        <>
                          <span className="px-2">|</span>
                          <TextLink href={rpc} target="_blank" content="RPC" />
                        </>
                      )}

                      {api && (
                        <>
                          <span className="px-2">|</span>
                          <TextLink href={api} target="_blank" content="API" />
                        </>
                      )}
                      {additions?.map((text) => (
                        <>
                          <span className="px-2">|</span>
                          {text}
                        </>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const data: Record<
  string,
  { name: string; link?: string; stake?: string; info?: string; additions?: string[]; rpc?: string; api?: string }[]
>[] = [
  {
    Mainnet: [
      {
        name: 'Cosmos hub',
        stake:
          'https://wallet.keplr.app/chains/cosmos-hub?modal=validator&chain=cosmoshub-4&validator_address=cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u&referral=true',
        info: 'https://www.mintscan.io/cosmos/validators/cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u',
        additions: ['Running since 2019', 'Running Testnet'],
      },
      {
        name: 'Celestia',
        stake:
          'https://wallet.keplr.app/chains/celestia?modal=validator&chain=celestia&validator_address=celestiavaloper1m77eksxfz9q50qejnqf720sns7q0xtx8uzxnhs',
        info: 'https://www.mintscan.io/cosmos/validators/cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u',
        additions: ['Pre-Genesis RPC Provider', 'Running Testnet'],
      },
      {
        name: 'Evmos',
        stake:
          'https://wallet.keplr.app/chains/evmos?modal=validator&chain=evmos_9001-2&validator_address=evmosvaloper1mtwvpdd57gpkyejd566s24afr9zm5ryq8gwpvj&referral=true',
        info: 'https://www.mintscan.io/evmos/validators/evmosvaloper1mtwvpdd57gpkyejd566s24afr9zm5ryq8gwpvj',
        additions: ['Genesis Validator'],
      },
      {
        name: 'LikeCoin',
        stake:
          'https://wallet.keplr.app/chains/likecoin?modal=validator&chain=likecoin-mainnet-2&validator_address=likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu',
        info: 'https://www.mintscan.io/likecoin/validators/likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu',
      },
      {
        name: 'BitCanna',
        stake: 'https://wallet.bitcanna.io/validators/bcnavaloper1ngt4atd3qlgcwfv7fkjdjxhz7k0vl2rejrvzye',
        info: 'https://www.mintscan.io/bitcanna/validators/bcnavaloper1ngt4atd3qlgcwfv7fkjdjxhz7k0vl2rejrvzye',
      },
      {
        name: 'Cyber/Bostrom',
        stake:
          'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
        info: 'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
        additions: ['Pre-Genesis & Genesis Validator'],
      },
      {
        name: 'Gravity Bridge',
        stake:
          'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
        info: 'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
      },
      {
        name: 'Composable',
        stake:
          'https://wallet.keplr.app/chains/bostrom?modal=validator&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&referral=true',
        info: 'https://explorer.nodestake.org/composable/staking/picavaloper1u96ny0k6c9lnsr66q2hleyu58nhvuurkqtd77r',
      },
      {
        name: 'Dymension',
        stake: 'https://portal.dymension.xyz/dymension/staking',
        info: 'https://dymension.explorers.guru/validator/dymvaloper1z3et7f750ym0cnvxcp7f8lsyynnmk82ts8ljzg',
        additions: ['Pre-Genesis & Genesis Validator'],
      },
      {
        name: 'QuickSilver',
        stake: 'https://quicksilver.explorers.guru/validator/quickvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8a7t9vq',
        info: 'https://quicksilver.explorers.guru/validator/quickvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8a7t9vq',
      },
      {
        name: 'GoVGen',
        stake: 'https://explorer.govgen.io/govgen/staking/govgenvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8pv6wce',
        info: 'https://explorer.govgen.io/govgen/staking/govgenvaloper1m77eksxfz9q50qejnqf720sns7q0xtx8pv6wce',
        additions: ['Pre-Genesis Validator. Governance-only chain'],
      },
      {
        name: 'Uptick',
        stake: 'https://uptick.explorers.guru/validator/uptickvaloper1ke3qlvuhcn537m47l3y3hj0v7jm48ka47nkduu',
        info: 'https://uptick.explorers.guru/validator/uptickvaloper1ke3qlvuhcn537m47l3y3hj0v7jm48ka47nkduu',
      },
    ],
    'Vaults / Relayers': [
      {
        name: 'Interlay: BTC-DOT',
        info: 'https://app.interlay.io/vaults/wd7mvsKzX8QaGh268wiqCpu8j7z5pAZhw1VUkcJPxwtNY14jb/DOT/IBTC',
      },
    ],
    ICS: [
      {
        name: 'Neutron',
        info: 'https://app.interlay.io/vaults/wd7mvsKzX8QaGh268wiqCpu8j7z5pAZhw1VUkcJPxwtNY14jb/DOT/IBTC',
        additions: ['Genesis Validator', 'Running Testnet'],
      },
      {
        name: 'Stride',
        info: 'https://www.mintscan.io/stride/ics-validators/cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u',
        additions: ['Genesis Validator', 'Running Governor'],
      },
    ],
    Governors: [
      {
        name: 'Stride',
        info: 'https://www.mintscan.io/stride/governors/',
      },
    ],
    'P.O.W.': [
      {
        name: 'Spacemesh',
        info: 'https://explorer.spacemesh.io/smeshers',
      },
    ],
  },
  {
    'Incitivezed Testnet / Stakenet': [
      {
        name: 'Nomic',
        stake: 'https://app.nomic.io/staking?validator=nomic1mk05ju8jq0mxzx3kfr0wcct8an2htjh53m4yk5&modal=info',
        info: 'https://nomic-explorer.quokkastake.io/nomic/staking/nomic1mk05ju8jq0mxzx3kfr0wcct8an2htjh53m4yk5',
        additions: ['Stakenet'],
      },
      { name: 'Namada', info: '/', additions: ['Pre-Genesis validator (Shielded Expedition)'] },
      {
        name: 'Soarchain',
        info: 'https://explorer.soarchain.com/soarchain/staking/soarvaloper1z66ujcpjxppue2u4pflwhakh0he4qup63586cx',
        additions: ['Pre-Genesis validator'],
      },
      {
        name: 'SpacePussy',
        stake: 'https://spacepussy.ai/network/bostrom/hero/pussyvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqhfj9et',
        info: 'https://spacepussy.ai/network/bostrom/hero/pussyvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqhfj9et',
      },
    ],
    Testnet: [
      {
        name: 'Namada',
        stake: 'https://shielded.live/validators/D4ADFBD41E607C7ADFEDE6DDAB53383A9D525EF9C7E70A742F48803A6D1EA4F8',
        additions: ['Pre-Genesis validator (Shielded Expedition)'],
      },
      {
        name: 'Union',
        stake: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
      },
      {
        name: 'Althea',
        stake: 'https://explorers.l0vd.com/union-testnet/staking/unionvaloper1kvr0mlfevhgrxvsxj8h4c9xrf9f90lmhgnpurg',
        info: 'https://exp.nodeist.net/Althea/staking/altheavaloper15v29dfawte5hzv9xr72tfcxwp679u7agvhhmkn',
        additions: ['Pre-Genesis validator - HALTED'],
      },
      {
        name: 'Symphony',
        stake: 'https://testnet.ping.pub/symphony/staking/symphonyvaloper1wpzkum4902l3978qyl24469ktlmt58u9yy9nsa',
        info: 'https://testnet.ping.pub/symphony/staking/symphonyvaloper1wpzkum4902l3978qyl24469ktlmt58u9yy9nsa',
        additions: ['Pre-Genesis Validator'],
      },
      {
        name: 'Neutron',
        info: 'https://explorer.polypore.xyz/pion-1/account/neutronvaloper18lz3nz3nyhtewm35npaccnc7javzmyvfxqaszw',
        additions: ['Test Network'],
      },
      {
        name: 'Cosmos',
        info: 'https://explorer.polypore.xyz/provider/staking/cosmosvaloper18lz3nz3nyhtewm35npaccnc7javzmyvfake7j7',
        additions: ['Test Network'],
      },
    ],
    'Public endpoints': [
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
    ],
    Researching: [{ name: 'List', link: 'https://github.com/citizenweb3/staking/issues/44', additions: ['Research'] }],
  },
];

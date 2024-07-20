import Link from 'next/link';

import Button from '@/components/common/button';
import SubTitle from '@/components/common/sub-title';

export default function Home() {
  return (
    <div>
      <SubTitle text="Staking" />
      <div className="flex flex-row items-center border-b border-bgSt py-4">
        <div className="text-[4rem] text-[#F20000]">?</div>
        <div className="ml-12 mt-4 text-base">
          Validator info is fully sponsored by the Citizen Web3 validator. Citizen Web3 monetizes itself via staking.
          <br />
          <br />
          Citizen Web3 helps to secure blockchain networks by providing infrastructure. This includes validator,
          testnet, and various public access nodes.
          <br />
          <br />
          We use Multi-party computation software (Horcrux) on all our nodes, to further secure funds, and protect
          stakers from double signing. We use Re-Stake on all of our mainnet nodes, set to restake twice per day, so
          users can compound their staking rewards more efficiently. Our current target is moving 95% of our
          infrastructure to (own) baremetal by spring 2024. We strongly believe in decentralized infrastructure,
          independent of the grid, and thats our end goal.
          <br />
          <br />
          Token holders of networks we validate, can stake with us to help secure these networks and to support our
          activities. Their incentive for doing so, is earning staking rewards, and other, planned, incentives in the
          future. We are devoted to our mission, we think out of the box, and are proud to be a little crazy. We value
          security, decentralization, privacy and lack of enforcement.
        </div>
      </div>
      <SubTitle text="Network" size="h3" />
      <div className="border-b border-bgSt py-4">
        {Object.keys(data).map((title) => (
          <div key={title} className="mx-6 my-4 text-base">
            <SubTitle text={title} size="h4" />
            <ul className="ml-4 mt-6 list-disc">
              {data[title].map(({ name, link, stake, info, rpc, additional }) => (
                <li key={name}>
                  {link ? (
                    <Link href={link} target="_blank" className="border-b border-bgSt hover:border-white">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                  {stake && (
                    <>
                      <span className="px-2">|</span>
                      <Link href={stake} target="_blank" className="border-b border-bgSt hover:border-white">
                        Stake
                      </Link>
                    </>
                  )}
                  {info && (
                    <>
                      <span className="px-2">|</span>
                      <Link href={info} target="_blank" className="border-b border-bgSt hover:border-white">
                        Info
                      </Link>
                    </>
                  )}

                  {rpc && (
                    <>
                      <span className="px-2">|</span>
                      <Link href={rpc} target="_blank" className="border-b border-bgSt hover:border-white">
                        RPC
                      </Link>
                    </>
                  )}
                  {additional && (
                    <>
                      <span className="px-2">|</span>
                      {additional}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <SubTitle text="Dao Stakes" size="h3" />
      <div className="ml-12 mt-4">
        <Button className="text-lg">Learn more</Button>
      </div>
    </div>
  );
}

const data: Record<
  string,
  { name: string; link?: string; stake?: string; info?: string; additional?: string; rpc?: string }[]
> = {
  Mainnet: [
    {
      name: 'Cosmos hub',
      stake:
        'https://wallet.keplr.app/chains/cosmos-hub?modal=staking&chain=cosmoshub-4&validator_address=cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u&step_id=3&action_id=stake',
      info: '/',
    },
    { name: 'Celestia', stake: '/', info: '/' },
    {
      name: 'Evmos',
      stake:
        'https://wallet.keplr.app/chains/evmos?modal=staking&chain=evmos_9001-2&validator_address=evmosvaloper1mtwvpdd57gpkyejd566s24afr9zm5ryq8gwpvj&step_id=3&action_id=stake',
      info: '/',
      additional: 'Genesis Validator',
    },
    {
      name: 'LikeCoin',
      stake:
        'https://wallet.keplr.app/chains/likecoin?modal=staking&chain=likecoin-mainnet-2&validator_address=likevaloper136r5phdpc02gmtmyampl9qkv0mdq385xxsaadu&step_id=3&action_id=stake',
      info: '/',
    },
    { name: 'BitCanna', stake: '/', info: '/' },
    {
      name: 'Cyber/Bostrom',
      stake:
        'https://wallet.keplr.app/chains/bostrom?modal=staking&chain=bostrom&validator_address=bostromvaloper1f7nx65pmayfenpfwzwaamwas4ygmvalqj6dz5r&step_id=3&action_id=stake',
      info: '/',
      additional: 'Pre-Genesis & Genesis Validator',
    },
    {
      name: 'Gravity Bridge',
      stake:
        'https://wallet.keplr.app/chains/gravity-bridge?modal=staking&chain=gravity-bridge-3&validator_address=gravityvaloper1a00v3m5sthed82267gvdp2qt9czhjngg2djy8m&step_id=3&action_id=stake',
      info: '/',
    },
    { name: 'Composable', stake: '/', info: '/' },
    { name: 'Dymension', stake: '/', info: '/', additional: 'Pre-Genesis & Genesis Validator' },
  ],
  ICS: [
    { name: 'Neutron', info: '/' },
    { name: 'Stride', info: '/' },
  ],
  'Incitivezed Testnet / Stakenet': [
    { name: 'Namada', info: '/', additional: 'Pre-Genesis validator (Shielded Expedition)' },
    { name: 'Nomic', stake: '/', info: '/', additional: 'Stakenet' },
    { name: 'Soarchain', info: '/', additional: 'Pre-Genesis validator' },
  ],
  Testnet: [{ name: 'Althea', info: '/', additional: 'Pre-Genesis validator' }],
  'Public endpoints': [
    { name: 'BitCanna', rpc: '/' },
    { name: 'LikeCoin', rpc: '/' },
  ],
  Relayer: [{ name: 'Bostrom - Osmosis', link: '/', additional: 'Stopped for now' }],
  Researching: [{ name: 'List', link: '/', additional: 'Long term research' }],
};

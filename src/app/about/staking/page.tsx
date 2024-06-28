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
          <div key={title} className="mx-6 text-base">
            <SubTitle text={title} size="h4" />
            <ul className="ml-4 mt-6 list-disc">
              {data[title].map(({ name, link, stake, info, rpc, additional }) => (
                <li key={name}>
                  {link ? (
                    <Link href={link} className="border-b border-bgSt hover:border-white">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                  {stake && (
                    <>
                      <span className="px-2">|</span>
                      <Link href={stake} className="border-b border-bgSt hover:border-white">
                        Stake
                      </Link>
                    </>
                  )}
                  {info && (
                    <>
                      <span className="px-2">|</span>
                      <Link href={info} className="border-b border-bgSt hover:border-white">
                        Info
                      </Link>
                    </>
                  )}

                  {rpc && (
                    <>
                      <span className="px-2">|</span>
                      <Link href={rpc} className="border-b border-bgSt hover:border-white">
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
      <Button className="ml-12 mt-4 text-lg">Learn more</Button>
    </div>
  );
}

const data: Record<
  string,
  { name: string; link?: string; stake?: string; info?: string; additional?: string; rpc?: string }[]
> = {
  Mainnet: [
    { name: 'Cosmos hub', stake: '/', info: '/' },
    { name: 'Celestia', stake: '/', info: '/' },
    { name: 'Evmos', stake: '/', info: '/', additional: 'Genesis Validator' },
    { name: 'LikeCoin', stake: '/', info: '/' },
    { name: 'BitCanna', stake: '/', info: '/' },
    { name: 'Cyber/Bostrom', stake: '/', info: '/', additional: 'Pre-Genesis & Genesis Validator' },
    { name: 'Gravity Bridge', stake: '/', info: '/' },
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

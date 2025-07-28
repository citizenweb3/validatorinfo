import Image from 'next/image';
import Link from 'next/link';

import RoundedButton from '@/components/common/rounded-button';
import StakingPageService, { StakingNetworksParams } from '@/services/stakingpage-service';

const GetStakingList = async () => {
  const networks: StakingNetworksParams[] = await StakingPageService.getNetworks();

  return (
    <>
      {networks && networks.length > 0 ? (
        <div className="grid grid-cols-4 gap-4 py-4">
          {networks.map((item, index) => (
            <div key={index} className="flex justify-between bg-card bg-left">
              <div className="relative flex h-40 w-48 flex-col bg-[url('/img/staking-bg.png')] bg-cover">
                <div className="-ml-1 -mt-7 flex flex-grow items-center justify-center">
                  {item.icon && (
                    <Link href={`https://staking.citizenweb3.com/chains/${item.name}`} target={`_blank`}>
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full"
                      />
                    </Link>
                  )}
                </div>
                <div className="absolute bottom-1 left-2 text-nowrap text-lg tracking-[0.25rem] text-shadow-sm">
                  {item.title}
                </div>
              </div>
              <div className="flex flex-col items-end justify-center pr-4">
                {item.stake && (
                  <RoundedButton href={item.stake} contentClassName="text-xl font-bold" target="_blank">
                    Stake
                  </RoundedButton>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex justify-center font-handjet text-lg">Getting Networks List...</div>
      )}
    </>
  );
};

export default GetStakingList;

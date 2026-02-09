import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { aztecIndexer } from '@/services/aztec-indexer-api';
import Link from 'next/link';

interface OwnProps {
  chainName: string;
}

const AztecBlockTimeDisplay: FC<OwnProps> = async ({ chainName }) => {
  const t = await getTranslations('NetworkPassport');
  const blockTime = await aztecIndexer.getAverageBlockTime({ cache: 'no-store' });
  const aztecAverageBlockTime = blockTime ? Number(blockTime) / 1000 : null;

  if (!aztecAverageBlockTime) {
    return null;
  }

  return (
    <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
      <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
        {t('average block time')}
      </div>
      <div
        className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight hover:underline">
        <Link href={`/networks/${chainName}/blocks`}>
          {aztecAverageBlockTime.toFixed(2)}s
        </Link>
      </div>
    </div>
  );
};

export default AztecBlockTimeDisplay;

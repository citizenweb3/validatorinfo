import Image from 'next/image';
import { FC } from 'react';

import formatCash from '@/utils/format-cash';

interface OwnProps {
  number?: number;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ number = 0 }) => {
  return (
    <div className="relative flex items-center justify-center text-sm">
      <Image src={'/img/icons/tmp/tvs-chart.svg'} alt="chart" width={66} height={59} className="min-w-16" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform font-retro text-sm">
        ${number ? formatCash(number) : '-'}
      </div>
    </div>
  );
};

export default ValidatorListItemTVS;

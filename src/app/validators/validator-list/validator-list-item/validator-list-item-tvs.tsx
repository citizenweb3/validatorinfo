import Image from 'next/image';
import { FC } from 'react';

interface OwnProps {
  number?: number;
}

const ValidatorListItemTVS: FC<OwnProps> = () => {
  return (
    <div className="relative flex items-center justify-center text-sm">
      <Image src={'/img/icons/tmp/tvs-chart.svg'} alt="chart" width={178} height={49} className="max-h-16 min-w-16" />
    </div>
  );
};

export default ValidatorListItemTVS;

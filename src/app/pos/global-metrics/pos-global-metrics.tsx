import Image from 'next/image';
import { FC } from 'react';

const PosGlobalMetrics: FC = () => {
  return (
    <Image
      src={'/img/charts/pos-chart-1.svg'}
      width={1195}
      height={408}
      alt="tem chart 1"
      className="border-b border-bgSt"
    />
  );
};

export default PosGlobalMetrics;

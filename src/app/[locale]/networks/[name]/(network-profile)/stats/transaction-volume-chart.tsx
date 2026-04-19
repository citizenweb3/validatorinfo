import Image from 'next/image';
import { FC } from 'react';

const TransactionVolumeChart: FC = () => {
  return (
    <div className="mt-6 mb-14 blur-sm pointer-events-none">
      <Image
        src="/img/charts/transaction-volume-chart.svg"
        alt="Transaction Volume Chart"
        width={1050}
        height={400}
        className="w-full"
      />
    </div>
  );
};

export default TransactionVolumeChart;

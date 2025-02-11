import Image from 'next/image';
import { FC } from 'react';

const RewardsGeneratedChart: FC = () => {
  return <Image src={'/img/charts/rewards-generated-chart.svg'} width={1200} height={280} alt="rewards generated" />;
};

export default RewardsGeneratedChart;

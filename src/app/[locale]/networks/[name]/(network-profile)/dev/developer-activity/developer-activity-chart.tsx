import Image from 'next/image';
import { FC } from 'react';

const DeveloperActivityChart: FC = () => {
  return <Image src={'/img/charts/dev-activity-chart.svg'} width={1200} height={200} alt="developer activity" className="w-full" />;
};

export default DeveloperActivityChart;

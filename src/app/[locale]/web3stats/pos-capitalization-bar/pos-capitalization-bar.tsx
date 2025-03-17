import Image from 'next/image';
import { FC } from 'react';

const PosCapitalizationBar: FC = () => {
  return (
    <Image src={'/img/charts/pos-chart-4.svg'} width={1315} height={316} alt="tem chart 1" className="w-full px-16" />
  );
};

export default PosCapitalizationBar;

import Image from 'next/image';
import { FC } from 'react';

const SecurityBar: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-lg">
      <Image src={'/img/charts/pos-glob-1.svg'} width={296} height={156} alt="tem chart 1" className="w-72" />
      <div>Security</div>
    </div>
  );
};

export default SecurityBar;

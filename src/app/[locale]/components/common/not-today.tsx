import Image from 'next/image';
import { FC } from 'react';

import RoundedButton from '@/components/common/rounded-button';
import icons from '@/components/icons';

const NotToday: FC = () => {
  return (
    <>
      <div className="relative mr-60 mt-5">
        <Image src={icons.NotToday} alt={'Error'} className="h-full w-full" />
        <div className="absolute right-0 top-5 text-5xl">
          <RoundedButton className="" href="/">
            Go Home
          </RoundedButton>
        </div>
      </div>
      <div className="-mt-9 h-12 bg-bgSt" />
    </>
  );
};

export default NotToday;

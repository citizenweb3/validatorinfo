import Image from 'next/image';
import { FC } from 'react';

import RoundedButton from '@/components/common/rounded-button';
import icons from '@/components/icons';

const NotToday: FC = () => {
  return (
    <>
      <div className="hidden md:block">
        <div className="relative mr-60 mt-5">
          <Image src={icons.NotToday} alt={'Error'} className="h-full w-full" />
          <div className="absolute right-0 top-5 text-5xl">
            <RoundedButton className="" href="/">
              Go Home
            </RoundedButton>
          </div>
        </div>
        <div className="-mt-9 h-12 bg-bgSt" />
      </div>
      <div className="md:hidden block">
        <div className="relative inline-block mt-20 sm:ml-80">
          <Image src={icons.NotTodayMobileIcon} alt={'Error'} className="h-full w-full" />
          <div className="absolute top-[65rem] right-[30rem] sm:top-[34rem] sm:right-[15rem]">
            <RoundedButton className="text-8xl sm:text-6xl" contentClassName="px-64 py-10 sm:px-32 sm:py-6" href="/">
              Go Home
            </RoundedButton>
          </div>
        </div>
        <div className="-mt-40 h-32 bg-bgSt" />
      </div>
    </>
  );
};

export default NotToday;

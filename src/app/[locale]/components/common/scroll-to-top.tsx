'use client';

import Image from 'next/image';
import { FC, useCallback, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import icons from '@/components/icons';

const ScrollToTop: FC = () => {
  const [isShowing, setIsShowing] = useState(false);

  const handleScroll = useCallback(() => {
    if (!isShowing && window.scrollY > 0) {
      setIsShowing(true);
    }

    if (isShowing && window.scrollY === 0) {
      setIsShowing(false);
    }
  }, [isShowing]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Button
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }}
      className={`${isShowing ? 'right-0' : '-right-10'} group/btt fixed bottom-4 transition delay-150 duration-1000 ease-in-out`}
      contentClassName="!p-1 !pt-0"
    >
      <Image src={icons.BttIcon} alt="btt" className="mt-1 w-7 group-hover/btt:hidden group-active/btt:hidden" />
      <Image
        src={icons.BttHoveredIcon}
        alt="btt"
        className="mt-2 hidden w-7 group-hover/btt:block group-active/btt:hidden"
      />
      <Image src={icons.BttActiveIcon} alt="btt" className="mt-2 hidden w-7 group-active/btt:block" />
    </Button>
  );
};

export default ScrollToTop;

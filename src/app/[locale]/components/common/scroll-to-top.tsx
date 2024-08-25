'use client';

import { FC, useCallback, useEffect, useState } from 'react';

import Button from '@/components/common/button';

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
      className={`${isShowing ? 'right-0' : '-right-10'} group/btt fixed bottom-4 h-14 w-9 !min-w-6`}
      contentClassName="!p-0"
    >
      <div className="relative h-14 w-9">
        <div
          className={`absolute left-1/2 top-1/2 min-h-7 min-w-10 -translate-x-1/2 -translate-y-1/2 rotate-90 transform bg-hide bg-contain bg-no-repeat group-hover/btt:bg-hide_h group-active/btt:bg-hide_a`}
        />
      </div>
    </Button>
  );
};

export default ScrollToTop;

'use client';

import { useTheme } from 'next-themes';
import { FC } from 'react';

import Button from '@/app/components/common/button';

interface OwnProps {}

const HeaderSettings: FC<OwnProps> = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div className="flex flex-row items-center space-x-1">
      <Button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="min-h-7">
        {resolvedTheme === 'dark' ? (
          <svg className="-my-0.5 h-4" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 0H11V4H13V0ZM0 11V13H4V11H0ZM24 11V13H20V11H24ZM13 24H11V20H13V24ZM8 6H16V8H8V6ZM6 8H8V16H6V8ZM8 18V16H16V18H8ZM18 16H16V8H18V16ZM20 2H22V4H20V2ZM20 4V6H18V4H20ZM22 22H20V20H22V22ZM20 20H18V18H20V20ZM4 2H2V4H4V6H6V4H4V2ZM2 22H4V20H6V18H4V20H2V22Z"
              stroke="none"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg className="-my-1.5 h-4" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              opacity="0.9"
              d="M4 0H12V2H10V4H8V2H4V0ZM2 4V2H4V4H2ZM2 14H0V4H2V14ZM4 16H2V14H4V16ZM6
              18H4V16H6V18ZM16 18V20H6V18H16ZM18 16V18H16V16H18ZM16 12H18V16H20V8H18V10H16V12ZM10 12V14H16V12H10ZM8
              10H10V12H8V10ZM8 10V4H6V10H8Z"
              fill="currentColor"
              stroke="currentColor"
            />
          </svg>
        )}
      </Button>
      <Button className="min-h-7 text-base">
        <div className="-my-1.5">EN</div>
      </Button>
      <Button className="min-h-7 text-base">
        <div className="-my-1.5">USD</div>
      </Button>
    </div>
  );
};

export default HeaderSettings;

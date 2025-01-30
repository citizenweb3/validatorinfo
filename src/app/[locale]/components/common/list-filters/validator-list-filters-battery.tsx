'use client';

import Image from 'next/image';
import { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';
import icons from '@/components/icons';

const ranges = [1, 10, 25, 50, 75, 100];
const rangesTo = [...ranges].reverse();

const ValidatorListFiltersBattery: FC = () => {
  const [from, setFrom] = useState<number>(1);
  const [to, setTo] = useState<number>(100);
  const [isFromOpened, setIsFromOpened] = useState<boolean>(false);
  const [isToOpened, setIsToOpened] = useState<boolean>(false);
  const refFrom = useRef(null);
  const refTo = useRef(null);
  useOnClickOutside(refFrom, () => setIsFromOpened(false));
  useOnClickOutside(refTo, () => setIsToOpened(false));

  return (
    <div className="px-2 py-0.5 text-lg">
      <div className="flex min-w-9 flex-row items-center space-x-2 py-px">
        <Image src={icons.BatterySmallIcon} className="-mr-1 mt-3.5 w-14" alt="battery" />
        <div>Range:</div>
        <div className="relative">
          <Button
            onClick={() => setIsFromOpened(!isFromOpened)}
            contentClassName={`py-0 px-2 max-h-6 text-lg font-handjet font-normal text-highlight`}
            className={`${isFromOpened && 'w-16'}`}
            activeType="switcher"
          >
            {from}%
          </Button>
          <div
            ref={refFrom}
            className={`${isFromOpened ? 'block' : 'hidden'} absolute left-0 top-6 z-40 flex w-16 flex-col`}
          >
            {ranges
              .filter((p) => p <= to)
              .map((p) => (
                <Button
                  key={p}
                  isActive={p === from}
                  activeType="switcher"
                  contentClassName="py-0 px-2 max-h-6 text-lg font-handjet hover:text-highlight"
                  onClick={() => {
                    setFrom(p);
                    setIsFromOpened(false);
                  }}
                >
                  {p}%
                </Button>
              ))}
          </div>
        </div>
        <div className="pl-1">to</div>
        <div className="relative">
          <Button
            onClick={() => setIsToOpened(!isToOpened)}
            contentClassName="py-0 px-2 max-h-6 text-lg font-handjet text-highlight"
            activeType="switcher"
          >
            {to}%
          </Button>
          <div
            ref={refTo}
            className={`${isToOpened ? 'block' : 'hidden'} absolute left-0 top-6 z-40 flex w-16 flex-col`}
          >
            {rangesTo
              .filter((p) => p >= from)
              .map((p) => (
                <Button
                  key={p}
                  isActive={p === to}
                  activeType="switcher"
                  contentClassName="py-0 px-2 max-h-6 text-lg font-handjet hover:text-highlight"
                  onClick={() => {
                    setTo(p);
                    setIsToOpened(false);
                  }}
                >
                  {p}%
                </Button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorListFiltersBattery;

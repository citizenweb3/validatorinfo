'use client';

import { FC, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';

const ranges = ['0', '1M', '10M', '100M', '500M', '1B', '10B', '100B', 'MAX'];
const rangesTo = [...ranges].reverse();

const EcosystemListFilterTvl: FC = () => {
  const [from, setFrom] = useState<string>('0');
  const [to, setTo] = useState<string>('MAX');
  const [isFromOpened, setIsFromOpened] = useState<boolean>(false);
  const [isToOpened, setIsToOpened] = useState<boolean>(false);
  const refFrom = useRef(null);
  const refTo = useRef(null);
  useOnClickOutside(refFrom, () => setIsFromOpened(false));
  useOnClickOutside(refTo, () => setIsToOpened(false));

  const fromIndex = ranges.indexOf(from);
  const toIndex = ranges.indexOf(to);

  return (
    <div className="py-0.5 text-lg mr-10">
      <div className="flex min-w-9 flex-row items-center space-x-4 py-px">
        <div>TVL</div>
        <div className="relative">
          <Button
            onClick={() => setIsFromOpened(!isFromOpened)}
            contentClassName="py-0 px-6 max-h-5 text-lg font-handjet font-normal text-highlight"
            className={`${isFromOpened && 'w-16'}`}
            activeType="switcher"
          >
            {from !== 'MAX' && from !== '0' ? `$${from}` : from}
          </Button>
          <div
            ref={refFrom}
            className={`${isFromOpened ? 'block' : 'hidden'} absolute left-0 top-6 z-40 flex w-16 flex-col`}
          >
            {ranges
              .filter((p) => ranges.indexOf(p) <= toIndex)
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
                  {p !== 'MAX' && p !== '0' ? `$${p}` : p}
                </Button>
              ))}
          </div>
        </div>
        <div className="pl-1">to</div>
        <div className="relative">
          <Button
            onClick={() => setIsToOpened(!isToOpened)}
            contentClassName="py-0 px-6 max-h-5 text-lg font-handjet text-highlight"
            activeType="switcher"
          >
            {to !== 'MAX' && to !== '0' ? `$${to}` : to}
          </Button>
          <div
            ref={refTo}
            className={`${isToOpened ? 'block' : 'hidden'} absolute left-0 top-6 z-40 flex w-16 flex-col`}
          >
            {rangesTo
              .filter((p) => ranges.indexOf(p) >= fromIndex)
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
                  {p !== 'MAX' && p !== '0' ? `$${p}` : p}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemListFilterTvl;

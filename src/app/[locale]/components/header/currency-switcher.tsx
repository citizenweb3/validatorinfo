'use client';

import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';

const currencies = ['usd', 'eur', 'rub', 'brl'];
export default function CurrencySwitcher() {
  const [currency, setCurrency] = useState('usd');
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    setIsOpened(false);
  });

  return (
    <div ref={ref} className="relative max-h-7 font-sfpro text-base">
      <Button
        onClick={() => setIsOpened(!isOpened)}
        className="tracking-none flex h-7 w-10 items-center justify-center uppercase"
        contentClassName="!px-0"
      >
        {currency}
      </Button>
      {isOpened && (
        <div className="absolute top-7 z-20 flex-col">
          {currencies
            .filter((cur) => cur !== currency)
            .map((cur) => (
              <Button
                key={cur}
                className="tracking-none h-7 w-14 uppercase"
                onClick={() => {
                  setCurrency(cur);
                  setIsOpened(false);
                }}
              >
                {cur}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}

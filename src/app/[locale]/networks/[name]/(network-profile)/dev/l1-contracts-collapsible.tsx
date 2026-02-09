'use client';

import Link from 'next/link';
import { FC, useState } from 'react';

import CopyButton from '@/components/common/copy-button';

interface L1Contract {
  key: string;
  name: string;
  address: string;
}

interface OwnProps {
  title: string;
  contracts: L1Contract[];
  etherscanBaseUrl: string;
}

const L1ContractsCollapsible: FC<OwnProps> = ({ title, contracts, etherscanBaseUrl }) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <>
      <div
        className="group mt-4 flex w-full cursor-pointer bg-table_row hover:bg-bgHover"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {title}
        </div>
        <div className="flex w-3/4 items-center gap-2 border-b border-bgSt py-6 pl-6">
          <div
            className={`h-4 w-4 bg-joystick_arrow_light bg-contain bg-no-repeat transition-transform duration-200
              ${isOpened ? '' : 'rotate-180'}
              group-hover:bg-joystick_arrow_a`}
          />
        </div>
      </div>
      {isOpened && contracts.map(({ key, name, address }) => (
        <div key={key} className="mt-4 flex w-full bg-table_row hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {name}
          </div>
          <div className="flex w-3/4 items-center gap-2 border-b border-bgSt py-6 pl-6">
            <Link
              href={`${etherscanBaseUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-handjet text-lg underline underline-offset-4 hover:text-highlight"
            >
              {address}
            </Link>
            <CopyButton value={address} size="md" />
          </div>
        </div>
      ))}
    </>
  );
};

export default L1ContractsCollapsible;

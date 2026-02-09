'use client';

import Link from 'next/link';
import { FC, useState } from 'react';

import BaseModal from '@/components/common/modal/base-modal';
import PlusButton from '@/components/common/plus-button';
import CopyButton from '@/components/common/copy-button';

interface L1Contract {
  name: string;
  address: string;
}

interface OwnProps {
  title: string;
  contracts: L1Contract[];
  etherscanBaseUrl: string;
}

const L1ContractsCard: FC<OwnProps> = ({ title, contracts, etherscanBaseUrl }) => {
  const [isModalOpened, setIsModalOpened] = useState(false);

  return (
    <div
      className="mx-1 flex flex-col items-center bg-table_row pt-2.5
        xs:w-[100px] sm:w-[130px] md:w-[150px] lg:w-[180px] xl:w-[200px] 2xl:w-[250px]"
    >
      <div className="text-center text-base text-highlight">{title}</div>
      <div className="mt-5 font-handjet text-lg">{contracts.length}</div>
      <div>
        <PlusButton size="sm" isOpened={isModalOpened} onClick={() => setIsModalOpened(true)} />
      </div>
      <BaseModal
        opened={isModalOpened}
        hideClose
        onClose={() => setIsModalOpened(false)}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="flex w-fit max-w-[90vw] flex-col">
          <div
            className="absolute right-0 top-0 z-50 h-8 w-8 bg-close bg-contain hover:bg-close_h active:bg-close_a"
            onClick={() => setIsModalOpened(false)}
          />
          <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2">
            {contracts.map(({ name, address }) => (
              <div key={name} className="contents">
                <span className="whitespace-nowrap text-right text-base text-highlight">{name}</span>
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
            ))}
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

export default L1ContractsCard;

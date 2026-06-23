import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import moneroService from '@/services/monero-service';
import { formatHashrate } from '@/utils/format-hashrate';

interface OwnProps {
  chainName: string;
  blockTimeTarget: string;
}

const formatRelativeTime = (date: Date | null | undefined, suffix: string): string => {
  if (!date) return '-';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return '-';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${suffix}`;
  const days = Math.floor(hours / 24);
  return `${days}d ${suffix}`;
};

const MoneroNetworkRows: FC<OwnProps> = async ({ chainName, blockTimeTarget }) => {
  const t = await getTranslations('NetworkPassport');
  const [snapshot, activePools] = await Promise.all([
    moneroService.getMoneroNetworkSnapshot(),
    moneroService.getMoneroActivePoolsCount('24h'),
  ]);

  if (!snapshot) {
    return (
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('tip height')}
        </div>
        <div className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg opacity-60">
          {t('no snapshot')}
        </div>
      </div>
    );
  }

  const difficultyDisplay = (() => {
    try {
      return BigInt(snapshot.difficulty).toLocaleString();
    } catch {
      return snapshot.difficulty;
    }
  })();

  return (
    <>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('tip height')}
        </div>
        <Link
          href={`/networks/${chainName}/blocks`}
          className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight hover:underline"
        >
          {snapshot.height.toLocaleString()}
        </Link>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('network hashrate')}
        </div>
        <div className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {formatHashrate(snapshot.hashrate)}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('current difficulty')}
        </div>
        <div className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {difficultyDisplay}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('last block time')}
        </div>
        <div className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {formatRelativeTime(snapshot.snapshotAt, t('ago'))}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('active pools')}
        </div>
        <div className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {activePools.toLocaleString()}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover">
        <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
          {t('block time target')}
        </div>
        <div className="flex w-2/3 items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
          {blockTimeTarget}
        </div>
      </div>
    </>
  );
};

export default MoneroNetworkRows;

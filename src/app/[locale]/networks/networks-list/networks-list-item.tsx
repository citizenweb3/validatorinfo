import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import icons from '@/components/icons';
import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import colorStylization from '@/utils/color-stylization';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  item: ChainWithParamsAndTokenomics;
  health?: number;
}

const NetworksListItem: FC<OwnProps> = async ({ item, health }) => {
  const t = await getTranslations('NetworksPage');
  const fdv = item?.name === 'ethereum-sepolia' || item?.name === 'warden-testnet' ? 0 : item?.tokenomics?.fdv;
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';
  const supply = 100;

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-1/3 px-2 py-2 font-sfpro hover:text-highlight">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableAvatar icon={item.logoUrl} name={item.prettyName} href={`/networks/${item.name}/overview`} />
            <Tooltip tooltip={t('Transactions')} direction="top">
              <Link href={`/networks/${item.name}/tx`} aria-label={`Transactions for ${item.prettyName}`}>
                <Image
                  src={icons.NetworkProfileHeaderTxs}
                  alt="TX"
                  width={30}
                  height={30}
                  className="opacity-70 hover:opacity-100"
                />
              </Link>
            </Tooltip>
          </div>
          {!item.supported && (
            <Tooltip tooltip={t('stoppedTooltip')} direction="top">
              <span className="font-handjet text-lg">{t('Stopped')}</span>
            </Tooltip>
          )}
        </div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <div className="text-center">{item.params?.denom}</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <Tooltip tooltip={`$${fdv?.toLocaleString()}`}>
          <div className="text-center">${formatCash(fdv ?? 0)}</div>
        </Tooltip>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-3 font-sfpro text-base">
        <div className="flex flex-col gap-1.5">
          <span className="font-handjet text-base">%{supply}</span>
          <div className="h-2.5 w-full overflow-hidden bg-primary">
            <div
              className="h-full bg-gradient-to-r from-[#2a3a1e] to-secondary"
              style={{ width: `${supply}%` }}
            />
          </div>
        </div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        {health !== undefined && health !== null ? (
          <div className="text-center" style={{ color: colorStylization.uptime(health) }}>
            {health.toFixed(1)}%
          </div>
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2">
        <div className="flex justify-center">
          {item.docs && item?.docs.startsWith('http') ? (
            <Link href={item.docs} className={`${size}`} target="_blank">
              <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
            </Link>
          ) : (
            <div className={`${size}`}>
              <div className={`${size} bg-web bg-contain bg-no-repeat opacity-40`} />
            </div>
          )}
          {item.githubUrl && item.githubUrl.startsWith('http') ? (
            <Link href={item.githubUrl} className={size} target="_blank">
              <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
            </Link>
          ) : (
            <div className={`${size}`}>
              <div className={`${size} bg-github bg-contain bg-no-repeat opacity-40`} />
            </div>
          )}
          {item.twitterUrl && item.twitterUrl.startsWith('http') ? (
            <Link href={item.twitterUrl} className={size} target="_blank">
              <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
            </Link>
          ) : (
            <div className={`${size}`}>
              <div className={`${size} bg-x bg-contain bg-no-repeat opacity-40`} />
            </div>
          )}
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworksListItem;

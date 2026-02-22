import Link from 'next/link';
import { FC } from 'react';

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
  const fdv = item?.name === 'ethereum-sepolia' || item?.name === 'warden-testnet' ? 0 : item?.tokenomics?.fdv;
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-1/3 px-2 py-2 font-sfpro hover:text-highlight">
        <TableAvatar icon={item.logoUrl} name={item.prettyName} href={`/networks/${item.name}/overview`} />
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <div className="text-center">{item.params?.denom}</div>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base">
        <Tooltip tooltip={`$${fdv?.toLocaleString()}`}>
          <div className="text-center">${formatCash(fdv ?? 0)}</div>
        </Tooltip>
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
      <BaseTableCell className="px-2 py-2 font-handjet text-lg text-center">
        <Link
          href={`/networks/${item.name}/tx`}
          className="text-highlight hover:underline"
          aria-label={`Show transactions for ${item.prettyName}`}
        >
          Show TX
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworksListItem;

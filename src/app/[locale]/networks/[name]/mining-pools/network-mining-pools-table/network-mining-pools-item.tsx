import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import { MoneroPoolStatsRow } from '@/services/monero-service';
import { formatHashrate } from '@/utils/format-hashrate';

interface OwnProps {
  stat: MoneroPoolStatsRow;
  minersLabel: string;
  minersTooltip: string;
}

// Per-network technical row, mirroring NetworkValidatorsItem: identity cell + numeric stat cells.
const NetworkMiningPoolsItem: FC<OwnProps> = ({ stat, minersLabel, minersTooltip }) => {
  // The pool detail page notFound's unverified pools, so only verified pools get a clickable avatar.
  // Unverified pools and the synthetic "unknown/solo" aggregate render as plain text (no dead link).
  const linkable = stat.pool.isVerified && stat.pool.slug !== 'unknown';

  return (
    <BaseTableRow>
      <BaseTableCell className="group/avatar w-1/3 px-2 py-2 font-sfpro hover:text-highlight">
        {linkable ? (
          <TableAvatar icon={stat.pool.logoUrl} name={stat.pool.name} href={`/mining-pools/${stat.pool.slug}/networks`} />
        ) : (
          <div className="flex h-full items-center font-sfpro text-base opacity-80">{stat.pool.name}</div>
        )}
      </BaseTableCell>

      <BaseTableCell className="px-2 py-2">
        <div className="text-center font-handjet text-lg">{stat.blocksFound}</div>
      </BaseTableCell>

      <BaseTableCell className="px-2 py-2">
        <div className="text-center font-handjet text-lg">{(stat.sharePercent ?? 0).toFixed(2)}%</div>
      </BaseTableCell>

      <BaseTableCell className="px-2 py-2">
        <Tooltip tooltip={minersTooltip}>
          <div className="text-center font-handjet text-lg">{minersLabel}</div>
        </Tooltip>
      </BaseTableCell>

      <BaseTableCell className="px-2 py-2">
        <div className="text-center font-handjet text-lg">{formatHashrate(stat.hashrateEstimate)}</div>
      </BaseTableCell>

      <BaseTableCell className="px-2 py-2">
        <div className="text-center font-handjet text-lg">
          {stat.pool.feePercent != null ? `${stat.pool.feePercent}%` : '-'}
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkMiningPoolsItem;

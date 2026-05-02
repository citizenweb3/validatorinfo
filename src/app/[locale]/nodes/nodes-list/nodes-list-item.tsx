import _ from 'lodash';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import Tooltip from '@/components/common/tooltip';
import { NodeWithChainAndConsensus } from '@/services/node-service';
import cutHash from '@/utils/cut-hash';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  item: NodeWithChainAndConsensus;
}

const NodesListItem: FC<OwnProps> = async ({ item }) => {
  const tokenDelegatorShares =
    item.chain.params?.coinDecimals != null
      ? Number(item.delegatorShares) / 10 ** item.chain.params?.coinDecimals
      : undefined;

  const hasMoniker = item.moniker && !item.moniker.startsWith('0x');
  const displayName = hasMoniker
    ? item.moniker
    : item.validatorId && item.moniker
      ? item.moniker
      : cutHash({ value: item.operatorAddress, cutLength: 10 });

  const nodeLink = item.validatorId
    ? `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`
    : '';

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/3 px-2 py-2 font-sfpro text-base hover:text-highlight">
        {nodeLink ? (
          <Link href={nodeLink}>
            <div className="break-words break-all">{displayName}</div>
          </Link>
        ) : (
          <div className="break-words break-all">{displayName}</div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={`/validators?p=1&ecosystems=${item.chain.ecosystem}`}>
          <div className="text-center">{_.capitalize(item.chain.ecosystem)}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={`/networks/${item.chain.name}/overview`}>
          <div className="text-center">{item.chain.prettyName}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg hover:text-highlight">
        <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
          <div className="text-center">{tokenDelegatorShares ? `$${formatCash(tokenDelegatorShares)}` : '-'}</div>
        </Tooltip>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NodesListItem;

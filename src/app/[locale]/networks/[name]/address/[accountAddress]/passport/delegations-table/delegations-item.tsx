import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import type { AccountDelegationRow } from '@/utils/cosmos-account-delegations';
import { formatDecimalForDisplay } from '@/utils/decimal-string';
import formatPrice from '@/utils/format-price';

interface OwnProps {
  item: AccountDelegationRow;
  denom: string;
  tokenPrice: number | null;
}

const DelegationsItem: FC<OwnProps> = ({ item, denom, tokenPrice }) => {
  const validatorNodePassportLink = item.validatorId
    ? `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`
    : null;
  const rewardAmount = Number(item.rewardAmount);
  const rewardValue =
    tokenPrice !== null && Number.isFinite(tokenPrice) && Number.isFinite(rewardAmount)
      ? rewardAmount * tokenPrice
      : null;
  const renderAmount = (amount: string) => (
    <div className="text-center">
      {formatDecimalForDisplay(amount)} {denom}
    </div>
  );

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 px-2 py-2 font-sfpro hover:text-highlight">
        {validatorNodePassportLink ? (
          <TableAvatar icon={item.validatorIcon} name={item.validatorName} href={validatorNodePassportLink} />
        ) : (
          <div className="flex flex-col py-2 text-center md:text-left">
            {item.validatorName !== item.operatorAddress ? <span>{item.validatorName}</span> : null}
            <span className="break-all font-handjet text-sm text-white/50">{item.operatorAddress}</span>
          </div>
        )}
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 font-handjet text-lg hover:text-highlight">
        {validatorNodePassportLink ? (
          <Link href={validatorNodePassportLink}>{renderAmount(item.stakedAmount)}</Link>
        ) : (
          renderAmount(item.stakedAmount)
        )}
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 font-handjet text-lg hover:text-highlight">
        {validatorNodePassportLink ? (
          <Link href={validatorNodePassportLink}>{renderAmount(item.rewardAmount)}</Link>
        ) : (
          renderAmount(item.rewardAmount)
        )}
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 font-handjet text-lg hover:text-highlight">
        <div className="text-center">{rewardValue === null ? '—' : `≈ $${formatPrice(rewardValue)}`}</div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default DelegationsItem;

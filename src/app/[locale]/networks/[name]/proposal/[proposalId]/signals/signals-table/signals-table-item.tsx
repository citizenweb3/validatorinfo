import { FC } from 'react';
import Link from 'next/link';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import CopyButton from '@/components/common/copy-button';
import icons from '@/components/icons';
import { SignalDisplay } from '@/services/aztec-signal-service';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  signal: SignalDisplay;
}

const SignalsTableItem: FC<OwnProps> = ({ signal }) => {
  const { signaler, round, timestamp } = signal;
  const providerLink = signaler.validatorId ? `/validators/${signaler.validatorId}/networks` : null;
  const sequencerLink = signaler.validatorId
    ? `/validators/${signaler.validatorId}/${signaler.address}/validator_passport/authz/withdraw_rewards`
    : null;
  const shortAddress = cutHash({ value: signaler.address, cutLength: 10 });

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-2 pl-2 font-sfpro text-base hover:text-highlight">
        {signaler.validatorId ? (
          <TableAvatar
            icon={signaler.validatorUrl ?? icons.AvatarIcon}
            name={signaler.moniker ?? ''}
            href={providerLink ?? ''}
          />
        ) : (
          <div className="h-[3.3125rem]" />
        )}
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-2 font-handjet text-lg text-center">
        <div className="flex items-center justify-center gap-2">
          {sequencerLink ? (
            <Link href={sequencerLink} className="hover:text-highlight">
              {shortAddress}
            </Link>
          ) : (
            <span>{shortAddress}</span>
          )}
          <CopyButton value={signaler.address} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-2 text-center font-handjet text-lg hover:text-highlight">
        {round}
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-2 text-center font-handjet text-lg hover:text-highlight">
        {new Date(timestamp).toLocaleString()}
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default SignalsTableItem;

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import {
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import {
  AztecSlashingEventDisplay,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';
import CopyButton from '@/components/common/copy-button';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  item: SlashingEventsExampleInterface | AztecSlashingEventDisplay;
  showValidatorColumns?: boolean;
}

const SlashingEventsItem: FC<OwnProps> = ({ item, showValidatorColumns = false }) => {
  const isAztecData = 'transactionHash' in item;

  if (isAztecData) {
    const aztecItem = item as AztecSlashingEventDisplay;
    const hasValidator = aztecItem.sequencer.hasValidator;
    const validatorId = aztecItem.validator?.id;
    const validatorMoniker = aztecItem.validator?.moniker || 'Unknown';
    const sequencerAddress = aztecItem.sequencer.address;

    const colWidth = showValidatorColumns ? 'w-1/4' : 'w-1/2';

    return (
      <BaseTableRow className="font-handjet text-lg">
        <BaseTableCell className={`${colWidth} py-4 hover:text-highlight`}>
          <Link
            href={`https://etherscan.io/block/${aztecItem.blockInfo.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <Tooltip tooltip={'Slashing event'} direction={'top'}>
              <Image
                src={icons.Warning}
                alt="warning"
                width={40}
                height={40}
                className="shrink-0"
              />
            </Tooltip>
            <div className="flex flex-1 items-center justify-center text-center hover:underline">
              {parseInt(aztecItem.blockInfo.number).toLocaleString('en-En')} [{aztecItem.blockInfo.time}]
            </div>
          </Link>
        </BaseTableCell>

        <BaseTableCell className={`${colWidth} px-2 py-2 hover:text-highlight`}>
          <Link
            href={aztecItem.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center font-semibold text-red-600 hover:underline">
              {aztecItem.slashAmount.tokens.toFixed(1)}{' '}
              {aztecItem.slashAmount.usd > 0 && (
                <div className="ml-1">
                  [${aztecItem.slashAmount.usd.toFixed(1)}]
                </div>
              )}
            </div>
          </Link>
        </BaseTableCell>

        {showValidatorColumns && (
          <>
            <BaseTableCell className="w-1/4 px-2 py-2 text-center">
              {hasValidator ? (
                <Link
                  href={`/validators/${validatorId}/networks`}
                  className="hover:text-highlight hover:underline"
                >
                  {validatorMoniker}
                </Link>
              ) : (
                <div className="hover:text-highlight">{cutHash({ value: sequencerAddress, cutLength: 12 })}</div>
              )}
            </BaseTableCell>

            <BaseTableCell className="w-1/4 px-2 py-2 text-center">
              {hasValidator ? (
                <Link
                  href={`/validators/${validatorId}/${sequencerAddress}/validator_passport/authz/withdraw_rewards`}
                  className="hover:text-highlight hover:underline"
                >
                  <div className="flex items-center justify-center">
                    {cutHash({ value: sequencerAddress, cutLength: 12 })}
                    <CopyButton value={sequencerAddress} size="md" />
                  </div>
                </Link>
              ) : (
                <div className="flex hover:text-highlight items-center justify-center">
                  {cutHash({ value: sequencerAddress, cutLength: 12 })}
                  <CopyButton value={sequencerAddress} size="md" />
                </div>
              )}
            </BaseTableCell>
          </>
        )}
      </BaseTableRow>
    );
  }

  const mockItem = item as SlashingEventsExampleInterface;
  return (
    <BaseTableRow className="font-handjet text-lg">
      <BaseTableCell className="w-1/2 py-4 hover:text-highlight">
        <Link href={''} className="flex w-full items-center">
          <Tooltip tooltip={'text'} direction={'top'}>
            <Image src={icons.Warning} alt="warning" width={40} height={40} className="shrink-0" />
          </Tooltip>
          <div className="flex flex-1 items-center justify-center text-center">
            {mockItem.retroName.height.toLocaleString('en-En')} [{mockItem.retroName.time}]
          </div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/2 px-2 py-2 hover:text-highlight">
        <Link href={''} className="flex items-center justify-center">
          <div className="flex items-center justify-center">
            {mockItem.commits.token.toFixed(1)} [${mockItem.commits.usd.toFixed(1)}]
          </div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default SlashingEventsItem;

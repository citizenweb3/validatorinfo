import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import icons from '@/components/icons';
import CopyButton from '@/components/common/copy-button';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import Tooltip from '@/components/common/tooltip';
import type { AccountVoteRow } from '@/services/account-governance-service';
import { formatBasisPoints, isWeightedGovernanceVote } from '@/utils/account-governance';
import cutHash from '@/utils/cut-hash';
import { cn } from '@/utils/cn';

const OPTION_ICONS: Record<AccountVoteRow['option'], typeof icons.GreenSquareIcon> = {
  YES: icons.GreenSquareIcon,
  NO: icons.RedSquareIcon,
  ABSTAIN: icons.YellowSquareIcon,
  VETO: icons.GraySquareIcon,
  UNSPECIFIED: icons.GraySquareIcon,
};

const OPTION_KEYS = {
  YES: 'vote-options.yes',
  NO: 'vote-options.no',
  ABSTAIN: 'vote-options.abstain',
  VETO: 'vote-options.veto',
  UNSPECIFIED: 'vote-options.unspecified',
} as const satisfies Record<AccountVoteRow['option'], string>;

const IMPACT_REASON_KEYS = {
  'proposal-unavailable': 'impact-proposal-unavailable',
  'voting-in-progress': 'impact-voting-in-progress',
  'tally-unavailable': 'impact-tally-unavailable',
  'stake-unavailable': 'impact-stake-unavailable',
} as const satisfies Record<NonNullable<AccountVoteRow['impactUnavailableReason']>, string>;

type AccountVoteRowProps = {
  row: AccountVoteRow;
  chainName: string;
};

const AccountVoteTableRow = ({ row, chainName }: AccountVoteRowProps) => {
  const t = useTranslations('AccountPage.Governance');
  const isWeighted = isWeightedGovernanceVote(row.weight);
  const impact = row.impactBasisPoints === null ? null : formatBasisPoints(BigInt(row.impactBasisPoints));
  const impactTooltip = row.impactUnavailableReason
    ? t(IMPACT_REASON_KEYS[row.impactUnavailableReason])
    : t('impact-methodology-tooltip');

  return (
    <BaseTableRow>
      <BaseTableCell className="w-2/5 py-4 text-base hover:text-highlight">
        <Link
          href={`/networks/${chainName}/proposal/${row.proposalId}`}
          className="flex items-center gap-3 hover:text-highlight"
        >
          <span className="font-handjet text-xl text-highlight">#{row.proposalId}</span>
          <span className="font-sfpro text-sm">{row.proposalTitle ?? t('proposal-title-unavailable')}</span>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center gap-1">
          <Image src={OPTION_ICONS[row.option]} alt={row.option} width={20} height={20} />
          <span className="font-handjet text-lg uppercase">{t(OPTION_KEYS[row.option])}</span>
          {isWeighted ? (
            <Tooltip tooltip={t('weighted-vote-tooltip')} direction="top">
              <span className="cursor-help border border-highlight px-2 py-0.5 font-sfpro text-xs text-highlight">
                {t('weighted-vote-badge')}
              </span>
            </Tooltip>
          ) : null}
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 hover:text-highlight">
        <div className="flex items-center justify-center">
          <Link href={`/networks/${chainName}/tx/${encodeURIComponent(row.txHash)}`} className="flex justify-center">
            <span className="underline-offset-3 text-center font-handjet text-lg underline">
              {cutHash({ value: row.txHash })}
            </span>
          </Link>
          <CopyButton value={row.txHash} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-2 text-center font-handjet text-lg hover:text-highlight">
        <Tooltip tooltip={impactTooltip} direction="top">
          <span className={cn('cursor-help', impact && 'text-highlight')}>
            {impact ? t('approximate-impact-value', { value: impact }) : '—'}
          </span>
        </Tooltip>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default AccountVoteTableRow;

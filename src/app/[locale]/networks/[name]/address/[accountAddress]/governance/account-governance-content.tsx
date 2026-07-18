import { getTranslations } from 'next-intl/server';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import Tooltip from '@/components/common/tooltip';
import AccountGovernanceService, { type AccountVotingHistoryReady } from '@/services/account-governance-service';
import { Locale } from '@/i18n';
import { isGovVotesChainSupported } from '@/utils/governance-supported-chains';

import AccountVoteTableRow from './account-vote-row';
import { accountVotesExample } from './account-votes-example';

const VOTES_PER_PAGE = 25;

type AccountGovernanceContentProps = {
  chainName: string;
  accountAddress: string;
  locale: Locale;
  page: number;
};

const AccountGovernanceContent = async ({ chainName, accountAddress, locale, page }: AccountGovernanceContentProps) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Governance' });
  const isMock = !isGovVotesChainSupported(chainName);
  const result: AccountVotingHistoryReady | { status: 'error' } | null = isMock
    ? accountVotesExample
    : await AccountGovernanceService.getAccountVotingHistory(chainName, accountAddress).then((history) =>
        history.status === 'unsupported' ? accountVotesExample : history.status === 'error' ? { status: 'error' } : history,
      );

  if (result === null || result.status === 'error') {
    return (
      <div className="pt-8 text-center font-sfpro text-lg text-white/60">{t('votes-load-error')}</div>
    );
  }

  const pageLength = Math.max(1, Math.ceil(result.rows.length / VOTES_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), pageLength);
  const pageRows = result.rows.slice((currentPage - 1) * VOTES_PER_PAGE, currentPage * VOTES_PER_PAGE);

  return (
    <div className="pt-8">
      <div className="overflow-x-auto">
        <BaseTable className="min-w-[760px]">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page="TxSummaryPage">
                <div className="flex items-center justify-center py-3">
                  <div className="text-nowrap text-6xl font-normal sm:text-4xl md:text-sm">{t('proposal-id-column')}</div>
                </div>
              </TableHeaderItem>
              <TableHeaderItem page="TxSummaryPage">
                <div className="flex items-center justify-center py-3">
                  <div className="text-nowrap text-6xl font-normal sm:text-4xl md:text-sm">{t('vote-column')}</div>
                </div>
              </TableHeaderItem>
              <TableHeaderItem page="TxSummaryPage">
                <div className="flex items-center justify-center py-3">
                  <div className="text-nowrap text-6xl font-normal sm:text-4xl md:text-sm">{t('vote-tx-column')}</div>
                </div>
              </TableHeaderItem>
              <TableHeaderItem page="TxSummaryPage">
                <div className="flex items-center justify-center py-3">
                  <Tooltip tooltip={t('impact-methodology-tooltip')} direction="top">
                    <div className="cursor-help text-nowrap text-6xl font-normal sm:text-4xl md:text-sm">
                      {t('network-impact-column')}
                    </div>
                  </Tooltip>
                </div>
              </TableHeaderItem>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <AccountVoteTableRow key={`${row.proposalId}:${row.txHash}`} row={row} chainName={chainName} />
            ))}
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center font-sfpro text-lg text-white/60">
                  {t('no-governance-activity')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </BaseTable>
      </div>

      {pageLength > 1 ? <TablePagination pageLength={pageLength} /> : null}

      {result.truncated ? (
        <p className="mt-4 text-center font-sfpro text-sm text-white/40">{t('votes-truncated-caption')}</p>
      ) : null}
      {isMock ? <p className="mt-6 text-center font-sfpro text-sm text-white/40">{t('mock-data-caption')}</p> : null}
    </div>
  );
};

export default AccountGovernanceContent;

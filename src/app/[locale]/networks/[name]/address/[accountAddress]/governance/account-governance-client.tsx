'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';

import { getAccountVotesBatch } from '@/actions/get-account-votes-batch';
import Doughnut, { doughnutChartColors } from '@/components/charts/doughnut/doughnut-chart';
import BaseTable from '@/components/common/table/base-table';
import Tooltip from '@/components/common/tooltip';
import type { AccountVoteRow, AccountVotingHistoryReady } from '@/services/account-governance-service';
import { deriveGovernanceCharts } from '@/utils/account-governance';

import AccountVoteTableRow from './account-vote-row';

type AccountGovernanceClientProps = {
  chainName: string;
  accountAddress: string;
  initial: AccountVotingHistoryReady | null;
  isMock: boolean;
};

const AccountGovernanceClient = ({ chainName, accountAddress, initial, isMock }: AccountGovernanceClientProps) => {
  const t = useTranslations('AccountPage.Governance');
  const [rows, setRows] = useState<AccountVoteRow[]>(initial?.rows ?? []);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [nextBeforeProposalId, setNextBeforeProposalId] = useState(initial?.nextBeforeProposalId ?? null);
  const [totalVotes, setTotalVotes] = useState(initial?.totalVotes ?? '0');
  const [totalClosedProposals, setTotalClosedProposals] = useState(initial?.totalClosedProposals ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(initial === null);
  const inFlight = useRef(false);

  const charts = useMemo(() => deriveGovernanceCharts(rows, totalClosedProposals), [rows, totalClosedProposals]);
  const optionLabels = [t('vote-options.yes'), t('vote-options.no'), t('vote-options.abstain'), t('vote-options.veto')];
  const optionValues = [charts.options.YES, charts.options.NO, charts.options.ABSTAIN, charts.options.VETO];
  const optionColors = [
    doughnutChartColors.green,
    doughnutChartColors.red,
    doughnutChartColors.yellow,
    doughnutChartColors.muted,
  ];

  const handleLoad = useCallback(async () => {
    if (isMock || inFlight.current) return;
    const cursor = rows.length > 0 ? nextBeforeProposalId ?? undefined : undefined;
    if (rows.length > 0 && !cursor) return;

    inFlight.current = true;
    setIsLoading(true);
    const result = await getAccountVotesBatch(chainName, accountAddress, cursor);
    inFlight.current = false;
    setIsLoading(false);

    if (!result.ok) {
      setHasError(true);
      return;
    }

    setHasError(false);
    setRows((currentRows) => {
      const seenProposalIds = new Set(currentRows.map((row) => row.proposalId));
      return [...currentRows, ...result.batch.rows.filter((row) => !seenProposalIds.has(row.proposalId))];
    });
    setHasMore(result.batch.hasMore);
    setNextBeforeProposalId(result.batch.nextBeforeProposalId);
    setTotalVotes(result.batch.totalVotes);
    setTotalClosedProposals(result.batch.totalClosedProposals);
  }, [accountAddress, chainName, isMock, nextBeforeProposalId, rows.length]);

  const showCharts = rows.length > 0;
  const showLoadMore = !isMock && hasMore && !hasError;

  return (
    <div className="pt-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-bgSt pb-2">
        <h2 className="font-handjet text-2xl text-highlight">{t('voting-history-title')}</h2>
        <div className="flex items-baseline gap-3">
          <span className="font-sfpro text-sm text-white/60">{t('total-votes-stat')}</span>
          <span className="font-handjet text-2xl text-highlight">{totalVotes}</span>
        </div>
      </div>

      {showCharts ? (
        <div className="mb-10 grid gap-10 lg:grid-cols-2">
          <section className="flex flex-col">
            <h3 className="mb-6 w-fit border-b border-bgSt pb-1 font-handjet text-xl text-highlight">
              {t('vote-options-chart-title')}
            </h3>
            <Doughnut
              labels={optionLabels}
              values={optionValues}
              colors={optionColors}
              datasetLabel={t('votes-dataset-label')}
              ariaLabel={t('vote-options-chart-aria')}
              className="w-full max-w-96"
            />
            {hasMore ? <p className="mt-4 font-sfpro text-sm text-white/50">{t('loaded-votes-caption')}</p> : null}
          </section>
          <section className="flex flex-col">
            <h3 className="mb-6 w-fit border-b border-bgSt pb-1 font-handjet text-xl text-highlight">
              {t('participation-chart-title')}
            </h3>
            <Doughnut
              labels={[t('participation-voted'), t('participation-not-voted')]}
              values={[charts.participation.voted, charts.participation.notVoted]}
              colors={[doughnutChartColors.green, doughnutChartColors.muted]}
              datasetLabel={t('closed-proposals-dataset-label')}
              ariaLabel={t('participation-chart-aria')}
              className="w-full max-w-96"
            />
            <p className="mt-4 font-sfpro text-sm text-white/50">
              {hasMore
                ? t('participation-loaded-caption', {
                    voted: charts.participation.voted,
                    total: charts.participation.totalClosedProposals,
                  })
                : t('participation-caption', {
                    voted: charts.participation.voted,
                    total: charts.participation.totalClosedProposals,
                  })}
            </p>
          </section>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <BaseTable className="min-w-[760px]">
          <thead>
            <tr>
              <th className="border-x-2 border-transparent bg-table_row bg-clip-padding px-4 py-3 text-center font-sfpro text-base shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                {t('proposal-id-column')}
              </th>
              <th className="border-x-2 border-transparent bg-table_row bg-clip-padding px-4 py-3 text-center font-sfpro text-base shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                {t('vote-column')}
              </th>
              <th className="border-x-2 border-transparent bg-table_row bg-clip-padding px-4 py-3 text-center font-sfpro text-base shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                {t('vote-height-column')}
              </th>
              <th className="border-x-2 border-transparent bg-table_row bg-clip-padding px-4 py-3 text-center font-sfpro text-base shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                <Tooltip tooltip={t('impact-methodology-tooltip')} direction="top">
                  <span className="cursor-help">{t('network-impact-column')}</span>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <AccountVoteTableRow key={`${row.proposalId}:${row.txHash}`} row={row} chainName={chainName} />
            ))}
            {rows.length === 0 && !hasError ? (
              <tr>
                <td colSpan={4} className="py-10 text-center font-sfpro text-lg text-white/60">
                  {t('no-governance-activity')}
                </td>
              </tr>
            ) : null}
            {hasError ? (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="font-sfpro text-lg text-white/60">{t('votes-load-error')}</span>
                    <button
                      type="button"
                      onClick={handleLoad}
                      disabled={isLoading}
                      className="font-handjet text-lg text-highlight underline disabled:cursor-wait disabled:opacity-60"
                    >
                      {isLoading ? t('loading-votes') : t('retry')}
                    </button>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </BaseTable>
      </div>

      {showLoadMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLoad}
            disabled={isLoading}
            className="border border-highlight px-8 py-3 font-handjet text-xl text-highlight shadow-md hover:bg-table_header disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? t('loading-votes') : t('load-more')}
          </button>
        </div>
      ) : null}

      {isMock ? <p className="mt-6 text-center font-sfpro text-sm text-white/40">{t('mock-data-caption')}</p> : null}
    </div>
  );
};

export default AccountGovernanceClient;

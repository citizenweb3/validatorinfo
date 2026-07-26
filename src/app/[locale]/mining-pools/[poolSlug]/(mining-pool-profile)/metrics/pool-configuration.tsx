import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ReactNode } from 'react';

import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableHeaderCell from '@/components/common/table/base-table-header-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import type { PoolConfiguration, PoolPayoutFee, PoolPayoutSchedule } from '@/server/tools/chains/monero/pool-client';

interface OwnProps {
  configuration: PoolConfiguration;
  locale: Locale;
}

interface ConfigurationItemProps {
  children: ReactNode;
  label: string;
}

const ConfigurationItem = ({ children, label }: ConfigurationItemProps) => (
  <BaseTableRow>
    <BaseTableCell className="w-1/3 py-4 hover:text-highlight">
      <div className="flex items-center justify-center text-center font-sfpro text-base">{label}</div>
    </BaseTableCell>
    <BaseTableCell className="w-2/3 px-2 py-2 hover:text-highlight">
      <div className="flex items-center justify-center text-center font-handjet text-lg">{children}</div>
    </BaseTableCell>
  </BaseTableRow>
);

const formatXmr = (value: number, locale: Locale): string =>
  `${value.toLocaleString(locale, { maximumFractionDigits: 8 })} XMR`;

const PoolConfigurationSection = async ({ configuration, locale }: OwnProps) => {
  const t = await getTranslations({ locale, namespace: 'MiningPoolDetail' });

  const payoutScheduleLabels: Record<PoolPayoutSchedule, string> = {
    'block-found': t('payoutScheduleBlockFound'),
    'every-10-minutes': t('payoutScheduleEveryTenMinutes'),
    hourly: t('payoutScheduleHourly'),
    threshold: t('payoutScheduleThreshold'),
  };

  const formatPayoutFee = (fee: PoolPayoutFee | null): string => {
    if (!fee) return t('notPublished');
    if (fee.kind === 'instant') return t('instantPayoutFee', { amount: formatXmr(fee.amountXmr, locale) });
    if (fee.kind === 'maximum') {
      return t('maximumPayoutFee', {
        amount: formatXmr(fee.amountXmr, locale),
        threshold: formatXmr(fee.waivedAboveXmr, locale),
      });
    }
    return formatXmr(fee.amountXmr, locale);
  };

  const verifiedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${configuration.verifiedAt}T00:00:00Z`),
  );

  return (
    <section aria-label={t('poolConfigurationTitle')}>
      <SubTitle text={t('poolConfigurationTitle')} />
      <div className="overflow-x-auto">
        <BaseTable className="my-12 min-w-[640px]">
          <thead>
            <tr className="bg-table_header">
              <BaseTableHeaderCell className="w-1/3 py-3">
                <div className="flex items-center justify-center text-sm">{t('configurationParameter')}</div>
              </BaseTableHeaderCell>
              <BaseTableHeaderCell className="w-2/3 py-3">
                <div className="flex items-center justify-center text-sm">{t('configurationValue')}</div>
              </BaseTableHeaderCell>
            </tr>
          </thead>
          <tbody>
            <ConfigurationItem label={t('poolSoftware')}>
              {configuration.software ? (
                <Link
                  href={configuration.software.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-3 underline hover:text-highlight"
                >
                  {configuration.software.name}
                </Link>
              ) : (
                t('notPublished')
              )}
            </ConfigurationItem>

            <ConfigurationItem label={t('serverRegions')}>
              {configuration.regionCodes?.join(' · ') ?? t('notPublished')}
            </ConfigurationItem>

            <ConfigurationItem label={t('minimumPayout')}>
              {configuration.minimumPayoutXmr === null
                ? t('notPublished')
                : formatXmr(configuration.minimumPayoutXmr, locale)}
            </ConfigurationItem>

            <ConfigurationItem label={t('payoutSchedule')}>
              {configuration.payoutSchedule ? payoutScheduleLabels[configuration.payoutSchedule] : t('notPublished')}
            </ConfigurationItem>

            <ConfigurationItem label={t('payoutFee')}>{formatPayoutFee(configuration.payoutFee)}</ConfigurationItem>

            <ConfigurationItem label={t('verifiedAt')}>{verifiedDate}</ConfigurationItem>

            <ConfigurationItem label={t('stratumEndpoints')}>
              <ul className="flex flex-col gap-3">
                {configuration.stratumEndpoints.map((endpoint) => (
                  <li
                    key={endpoint.host}
                    className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:gap-4"
                  >
                    <code className="break-all font-handjet text-lg">{endpoint.host}</code>
                    <span className="flex flex-wrap gap-2">
                      {endpoint.ports.map(({ port, tls }) => (
                        <code key={`${endpoint.host}-${port}`} className="bg-background px-2 py-1 text-sm">
                          {port} · {tls ? 'TLS' : t('plainConnection')}
                        </code>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </ConfigurationItem>

            <ConfigurationItem label={t('officialSources')}>
              <span className="flex flex-wrap justify-center gap-3">
                {configuration.sourceUrls.map((sourceUrl, index) => (
                  <Link
                    key={sourceUrl}
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-3 underline hover:text-highlight"
                  >
                    {t('officialSourceNumber', { number: index + 1 })}
                  </Link>
                ))}
              </span>
            </ConfigurationItem>
          </tbody>
        </BaseTable>
      </div>
      <p className="mt-4 font-sfpro text-sm opacity-75">{t('poolConfigurationDisclaimer')}</p>
    </section>
  );
};

export default PoolConfigurationSection;

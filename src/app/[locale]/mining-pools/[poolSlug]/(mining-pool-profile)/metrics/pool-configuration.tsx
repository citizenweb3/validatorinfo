import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ReactNode } from 'react';

import SubTitle from '@/components/common/sub-title';
import { Locale } from '@/i18n';
import type { PoolConfiguration, PoolPayoutFee, PoolPayoutSchedule } from '@/server/tools/chains/monero/pool-client';
import { cn } from '@/utils/cn';

interface OwnProps {
  configuration: PoolConfiguration;
  locale: Locale;
}

interface ConfigurationItemProps {
  children: ReactNode;
  label: string;
  wide?: boolean;
}

const ConfigurationItem = ({ children, label, wide = false }: ConfigurationItemProps) => (
  <div className={cn('border-r border-t border-bgSt bg-table_row p-4', wide && 'md:col-span-2')}>
    <dt className="font-sfpro text-sm opacity-75">{label}</dt>
    <dd className="mt-2 font-handjet text-lg text-highlight">{children}</dd>
  </div>
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
      <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <ConfigurationItem label={t('stratumEndpoints')} wide>
          <ul className="flex flex-col gap-3">
            {configuration.stratumEndpoints.map((endpoint) => (
              <li key={endpoint.host} className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <code className="break-all font-handjet text-lg">{endpoint.host}</code>
                <span className="flex flex-wrap gap-2">
                  {endpoint.ports.map(({ port, tls }) => (
                    <code
                      key={`${endpoint.host}-${port}`}
                      className="border border-bgSt bg-background px-2 py-1 text-sm"
                    >
                      {port} · {tls ? 'TLS' : t('plainConnection')}
                    </code>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </ConfigurationItem>

        <ConfigurationItem label={t('officialSources')} wide>
          <span className="flex flex-wrap gap-3">
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
      </dl>
      <p className="mt-4 font-sfpro text-sm opacity-75">{t('poolConfigurationDisclaimer')}</p>
    </section>
  );
};

export default PoolConfigurationSection;

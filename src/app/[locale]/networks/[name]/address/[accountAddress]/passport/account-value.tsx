import { getTranslations } from 'next-intl/server';
import { type FC } from 'react';

import AccountValueClient from '@/app/networks/[name]/address/[accountAddress]/passport/account-value-client';
import { Locale } from '@/i18n';
import AccountBalanceService from '@/services/account-balance-service';
import { formatBaseUnits } from '@/utils/decimal-string';

interface OwnProps {
  chainName: string;
  accountAddress: string;
  locale: Locale;
}

const formatTokenAmount = (baseUnits: string, coinDecimals: number, denom: string, locale: Locale): string => {
  const [whole, fraction = ''] = formatBaseUnits(baseUnits, coinDecimals).split('.');
  const visibleFraction = fraction.slice(0, 6).replace(/0+$/, '');
  const separator = new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value;
  const number = `${BigInt(whole).toLocaleString(locale)}${visibleFraction ? `${separator ?? '.'}${visibleFraction}` : ''}`;
  return `${number} ${denom}`;
};

const formatRelativeTime = (date: Date, locale: Locale): string => {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1_000));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (elapsedSeconds < 60) return formatter.format(-elapsedSeconds, 'second');

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return formatter.format(-elapsedMinutes, 'minute');

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return formatter.format(-elapsedHours, 'hour');
  return formatter.format(-Math.floor(elapsedHours / 24), 'day');
};

const AccountValue = async ({ chainName, accountAddress, locale }: OwnProps) => {
  const [t, result] = await Promise.all([
    getTranslations({ locale, namespace: 'AccountPage.Passport' }),
    AccountBalanceService.getAccountValue(chainName, accountAddress),
  ]);
  const commonProps = {
    accountValueLabel: t('account value'),
    tokenLabel: t('token'),
    usdLabel: t('usd'),
    toggleLabel: t('accountValueToggle'),
  };

  if (result.status !== 'ready') {
    return (
      <AccountValueClient
        {...commonProps}
        tokenValue={null}
        usdValue={null}
        tooltip={t(result.status === 'pending' ? 'accountValuePending' : 'accountValueUnsupported')}
      />
    );
  }

  const formatPart = (baseUnits: string) => formatTokenAmount(baseUnits, result.coinDecimals, result.denom, locale);
  const tooltip = [
    t('accountValueLiquid', { value: formatPart(result.liquid) }),
    t('accountValueStaked', { value: formatPart(result.staked) }),
    t('accountValueUnbonding', { value: formatPart(result.unbonding) }),
    t('accountValueRewards', { value: formatPart(result.rewards) }),
    t('accountValueUpdated', { ago: formatRelativeTime(result.updatedAt, locale) }),
  ].join('\n');
  const usdValue =
    result.totalUsd === null
      ? null
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(result.totalUsd);

  return (
    <AccountValueClient
      {...commonProps}
      tokenValue={formatPart(result.totalBase)}
      usdValue={usdValue}
      tooltip={tooltip}
    />
  );
};

export const AccountValueSkeleton: FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col" aria-hidden>
    <div className="flex min-h-6 justify-end">
      <div className="h-6 w-32 animate-pulse rounded bg-primary" />
    </div>
    <div className="mt-2.5 flex items-center justify-between px-4 py-1 shadow-button">
      <div className="font-sfpro text-lg">{label}:</div>
      <div className="mx-20 h-6 w-28 animate-pulse rounded bg-primary" />
    </div>
  </div>
);

export default AccountValue;

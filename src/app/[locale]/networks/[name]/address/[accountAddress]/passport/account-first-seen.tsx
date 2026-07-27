import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { Locale } from '@/i18n';
import AccountFirstSeenService from '@/services/account-first-seen-service';

interface OwnProps {
  chainName: string;
  accountAddress: string;
  locale: Locale;
}

const formatFirstSeenDate = (value: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));

const AccountFirstSeen = async ({ chainName, accountAddress, locale }: OwnProps) => {
  const [t, firstSeen] = await Promise.all([
    getTranslations({ locale, namespace: 'AccountPage.Passport' }),
    AccountFirstSeenService.getFirstSeen(chainName, accountAddress),
  ]);
  if (!firstSeen) return null;

  const date = formatFirstSeenDate(firstSeen.time, locale);
  const value = firstSeen.atOrBefore
    ? t('firstSeenAtOrBefore', { date })
    : firstSeen.source === 'genesis'
      ? t('firstSeenAtGenesis', { date })
      : t('firstSeenIndexed', { date, height: firstSeen.height });

  return (
    <div className="mt-4 flex max-w-2xl items-center justify-between gap-6 px-4 py-2 shadow-button" aria-live="polite">
      <div className="font-sfpro text-lg">{t('joinDate')}:</div>
      <div className="text-right font-handjet text-xl text-highlight">{value}</div>
    </div>
  );
};

export const AccountFirstSeenSkeleton: FC<{ label: string }> = ({ label }) => (
  <div className="mt-4 flex max-w-2xl items-center justify-between gap-6 px-4 py-2 shadow-button" aria-hidden>
    <div className="font-sfpro text-lg">{label}:</div>
    <div className="h-6 w-56 animate-pulse rounded bg-primary" />
  </div>
);

export default AccountFirstSeen;

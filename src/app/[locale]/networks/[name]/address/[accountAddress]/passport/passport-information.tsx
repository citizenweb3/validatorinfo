import { FC, Suspense } from 'react';

import AccountFirstSeen, {
  AccountFirstSeenSkeleton,
} from '@/app/networks/[name]/address/[accountAddress]/passport/account-first-seen';
import AccountValue, {
  AccountValueSkeleton,
} from '@/app/networks/[name]/address/[accountAddress]/passport/account-value';
import CopyButton from '@/components/common/copy-button';
import QrCodeButton from '@/components/common/qrcode-button';
import RoundedButton from '@/components/common/rounded-button';
import { Locale } from '@/i18n';

type PassportInformationLabels = {
  multichainPortfolio: string;
  claimAddress: string;
  accountValue: string;
  joinDate: string;
};

interface OwnProps {
  accountAddress: string;
  chainName: string;
  locale: Locale;
  labels: PassportInformationLabels;
}

const PassportInformation: FC<OwnProps> = ({ accountAddress, chainName, locale, labels }) => {
  return (
    <div>
      <div className="flex flex-row">
        <div className="mt-1 font-handjet text-2xl">{accountAddress}</div>
        <div className="ml-2 mr-1">
          <CopyButton value={accountAddress} size="lg" />
        </div>
        <QrCodeButton size="lg" />
      </div>
      <Suspense fallback={<AccountFirstSeenSkeleton label={labels.joinDate} />}>
        <AccountFirstSeen chainName={chainName} accountAddress={accountAddress} locale={locale} />
      </Suspense>
      <div className="flex flex-row justify-between">
        <div className="mt-14 flex flex-row items-end">
          <RoundedButton className="mr-12 font-handjet text-lg">{labels.multichainPortfolio}</RoundedButton>
          <RoundedButton className="font-handjet text-lg">{labels.claimAddress}</RoundedButton>
        </div>
        <div className="flex flex-col">
          <Suspense
            key={`${chainName}:${accountAddress}`}
            fallback={<AccountValueSkeleton label={labels.accountValue} />}
          >
            <AccountValue chainName={chainName} accountAddress={accountAddress} locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PassportInformation;

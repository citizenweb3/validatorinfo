import { unstable_setRequestLocale } from 'next-intl/server';
import { FC } from 'react';

import ValidatorList from '@/app/validators/validator-list/validator-list';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

interface OwnProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
interface OwnProps {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { locale: Locale };
}
const ValidatorsPage: FC<OwnProps> = ({ searchParams, params: { locale } }) => {
  unstable_setRequestLocale(locale);

  const currentPage = parseInt((searchParams?.p as string) ?? '1');

  const chains: string[] = !searchParams.chains
    ? []
    : typeof searchParams.chains === 'string'
      ? [searchParams.chains]
      : searchParams.chains;
  return (
    <div>
      <TabList page="HomePage" tabs={validatorTabs} />
      <ValidatorList chains={chains} currentPage={currentPage} />
    </div>
  );
};

export default ValidatorsPage;

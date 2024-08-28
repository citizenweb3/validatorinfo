import { unstable_setRequestLocale } from 'next-intl/server';
import { FC } from 'react';

import ValidatorList from '@/app/validators/validator-list/validator-list';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

interface OwnProps {
  searchParams: { [key: string]: string | string[] | undefined };
  params: { locale: Locale };
}
const Home: FC<OwnProps> = ({ searchParams, params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const chains: string[] = !searchParams.chains
    ? []
    : typeof searchParams.chains === 'string'
      ? [searchParams.chains]
      : searchParams.chains;
  return (
    <div>
      <TabList page="HomePage" tabs={validatorTabs} />
      <ValidatorList chains={chains} />
    </div>
  );
};

export default Home;

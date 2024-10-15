import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import SimpleValidatorList from '@/app/validators/simple-validator-list/simple-validator-list';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { validatorsTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import ChainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const ValidatorsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ValidatorsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const chains = await ChainService.getAll(0, 10000);
  const validatorsPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const validators = await ValidatorService.getAll(validatorsPerPage * (currentPage - 1), validatorsPerPage);
  const filterChains: string[] = !q.chains ? [] : typeof q.chains === 'string' ? [q.chains] : q.chains;

  return (
    <div>
      <TabList page="ValidatorsPage" tabs={validatorsTabs} />
      <SubTitle text={t('title')} />
      <SimpleValidatorList
        perPage={validatorsPerPage}
        validators={validators}
        chains={chains}
        filterChains={filterChains}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ValidatorsPage;

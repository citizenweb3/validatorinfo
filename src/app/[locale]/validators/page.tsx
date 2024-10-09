import { NextPage } from 'next';

import SimpleValidatorList from '@/app/validators/simple-validator-list/simple-validator-list';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';
import ChainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';
import { Chain } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const ValidatorsPage: NextPage<PageProps> = async ({ searchParams: q }) => {
  const currentPage = parseInt((q.p as string) || '1');
  const chains: Chain[] = await ChainService.getAll();
  const validatorsPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const validators = await ValidatorService.getAll(validatorsPerPage * (currentPage - 1), validatorsPerPage);
  const filterChains: string[] = !q.chains ? [] : typeof q.chains === 'string' ? [q.chains] : q.chains;

  return (
    <div>
      <TabList page="HomePage" tabs={validatorTabs} />
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

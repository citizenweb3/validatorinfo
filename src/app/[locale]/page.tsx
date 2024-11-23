import { NextPage } from 'next';

import Validators from '@/app/main-validators/validator-list/validators';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';

import WalletButton from '@/components/wallet-connect/WalletButton';
import ChainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';

import { SortDirection } from '@/services/validator-service';
>

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const Home: NextPage<PageProps> = async ({ searchParams: q }) => {
  const currentPage = parseInt((q.p as string) || '1');
  const validatorsPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const filterChains: string[] = !q.chains ? [] : typeof q.chains === 'string' ? [q.chains] : q.chains;
  const sortBy = (q.sortBy as 'moniker' | 'nodes') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';

  // const wallet = useWallet();

  return (
    <div>
      <WalletButton />
      <TabList page="HomePage" tabs={mainTabs} />
      <Validators
        sort={{ sortBy, order }}
        perPage={validatorsPerPage}
        filterChains={filterChains}
        currentPage={currentPage}
      />
    </div>
  );
};

export default Home;

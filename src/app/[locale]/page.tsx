import { NextPage } from 'next';

import Validators from '@/app/main-validators/validator-list/validators';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { SortDirection } from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const Home: NextPage<PageProps> = async ({ searchParams: q }) => {
  const currentPage = parseInt((q.p as string) || '1');
  const validatorsPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const filterChains: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;
  const sortBy = (q.sortBy as 'moniker' | 'nodes') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <Validators
        page="HomePage"
        sort={{ sortBy, order }}
        perPage={validatorsPerPage}
        filterChains={filterChains}
        currentPage={currentPage}
      />
    </div>
  );
};

export default Home;

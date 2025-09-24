import { getTranslations } from 'next-intl/server';

import ValidatorsMobile from '@/app/main-validators/validator-list-mobile/validators-mobile';
import ConsolePanel from '@/app/main-validators/validator-list/console-panel';
import Validators from '@/app/main-validators/validator-list/validators';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const Home: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const currentPage = parseInt((q.p as string) || '1');
  const validatorsPerPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const ecosystems: string[] = !q.ecosystems ? [] : typeof q.ecosystems === 'string' ? [q.ecosystems] : q.ecosystems;
  const sortBy = (q.sortBy as 'moniker' | 'nodes' | undefined) ?? undefined;
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <div className="hidden md:block">
        <PageTitle text={t('title')} />
        <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2 mb-2'} />
      </div>
      <div className="hidden md:block">
        <div className="mt-4 flex">
          <div className="min-w-0 flex-[42%]">
            <div className="overflow-x-auto">
              <Validators
                page="HomePage"
                sort={{ sortBy, order }}
                perPage={validatorsPerPage}
                ecosystems={ecosystems}
                currentPage={currentPage}
              />
            </div>
          </div>
          <div className="ml-4 flex-[58%]">
            <ConsolePanel />
          </div>
        </div>
      </div>
      <div className="block md:hidden">
        <ValidatorsMobile
          page="HomePage"
          sort={{ sortBy, order }}
          perPage={validatorsPerPage}
          ecosystems={ecosystems}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default Home;

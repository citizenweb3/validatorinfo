import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import ValidatorsMobile from '@/app/main-validators/validator-list-mobile/validators-mobile';
import ConsolePanel from '@/app/main-validators/validator-list/console-panel';
import ValidatorsGame from '@/app/main-validators/validator-list/validators-game';
import ValidatorsDev from '@/app/main-validators/validator-list/validators-dev';
import LayoutToggle from '@/components/layout-toggle';
import ValidatorLayoutContainer from '@/app/main-validators/validator-layout-container';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';

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

  const chains = await chainService.getAllLight();
  const chanId = Math.floor(Math.random() * 20);
  const chain = chains.find((chain) => chanId === chain.id);

  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <div className="hidden md:block">
        <PageTitle text={t('title')} />
        <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2 mb-2'} />
      </div>
      <div className="hidden md:block">
        <LayoutToggle />
        <Suspense fallback={<div className="mt-4 text-base">Loading...</div>}>
          <ValidatorLayoutContainer
            gameMode={
              <div className="mt-4 flex">
                <div className="flex-[58%]">
                  <ConsolePanel chainName={chain?.name ?? 'cosmoshub'} />
                </div>
                <div className="min-w-0 flex-[42%] ml-4">
                  <div className="overflow-x-auto">
                    <ValidatorsGame
                      page="HomePage"
                      sort={{ sortBy, order }}
                      perPage={validatorsPerPage}
                      ecosystems={ecosystems}
                      currentPage={currentPage}
                    />
                  </div>
                </div>
              </div>
            }
            devMode={
              <div className="mt-4">
                <ValidatorsDev
                  page="HomePage"
                  sort={{ sortBy, order }}
                  perPage={validatorsPerPage}
                  ecosystems={ecosystems}
                  currentPage={currentPage}
                />
              </div>
            }
          />
        </Suspense>
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

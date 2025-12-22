import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import NetworkBlocks from '@/app/networks/[name]/blocks/blocks-table/network-blocks';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 20;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TotalBlocksPage' });

  return {
    title: t('title'),
  };
}

const TotalBlocksPage: NextPageWithLocale<PageProps> = async ({ params: { name, locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'TotalBlocksPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const chain = await chainService.getByName(name);

  return (
    <div className="mb-24">
      <PageTitle
        text={t('title')}
        prefix={
          <Link href={`/networks/${chain?.name}/overview`} className="group">
            <div className="flex flex-row">
              <span className="group-hover:text-oldPalette-white group-active:text-3xl">{chain?.prettyName}</span>
              <div className="h-7 min-h-7 w-7 min-w-7 bg-cursor bg-contain bg-no-repeat group-hover:bg-cursor_h group-active:bg-cursor_a" />
            </div>
          </Link>
        }
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NetworkBlocks
        name={name}
        page={'TotalBlocksPage'}
        perPage={perPage}
        currentPage={currentPage}
      />
    </div>
  );
};

export default TotalBlocksPage;

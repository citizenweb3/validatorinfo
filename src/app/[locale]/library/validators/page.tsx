import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import Letter from '@/app/metrics/letter';
import Letters from '@/app/metrics/letters';
import Switcher from '@/app/metrics/switcher';
import PageTitle from '@/components/common/page-title';
import PlusButton from '@/components/common/plus-button';
import { NextPageWithLocale } from '@/i18n';
import LibraryTagsFilter from '@/app/library/library-tags-filter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
}

const LibraryPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <LibraryTagsFilter />
      <Letters />
      <Letter letter="H" />
      <div className="mt-6">
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>{t('how to run a node on cosmos')}</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>Text</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>Text</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
        <div className="flex w-1/2 items-center justify-between border-b border-primary p-5 px-5 text-base font-bold">
          <div>Text</div>
          <PlusButton size="sm" isOpened={false} />
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;

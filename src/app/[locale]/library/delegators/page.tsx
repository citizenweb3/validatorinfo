import { getTranslations } from 'next-intl/server';

import LibraryTagsFilter from '@/app/library/library-tags-filter';
import Letter from '@/app/metrics/letter';
import Letters from '@/app/metrics/letters';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PlusButton from '@/components/common/plus-button';
import RichPageTitle from '@/components/common/rich-page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import TextLink from '@/components/common/text-link';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale;
  searchParams: { [key: string]: string | string[] | undefined };
}

const LibraryDelegatorsPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'LibraryPage' });
  const tags: string[] = !q.tags ? [] : typeof q.tags === 'string' ? [q.tags] : q.tags;

  return (
    <div>
      <CollapsiblePageHeader description={t('Delegators.description')}>
        <RichPageTitle>
          <div className="m-4">
            {t.rich('Delegators.title', {
              compareLink: (chunks) => <TextLink content={chunks} href="/comparevalidators" />,
            })}
          </div>
        </RichPageTitle>
      </CollapsiblePageHeader>
      <SubTitle text={t('UnderConstruction')} className={'my-4'} />
      <div className="blur-sm">
        <LibraryTagsFilter selectedTags={tags} />
        <Letters />
        <div className="flex flex-row items-center justify-between">
          <Letter letter="H" />
          <RoundedButton href={''} className="font-handjet text-lg">
            {t('Submit New Info')}
          </RoundedButton>
        </div>
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
    </div>
  );
};

export default LibraryDelegatorsPage;

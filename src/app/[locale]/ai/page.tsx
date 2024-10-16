import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import { NextPageWithLocale } from '@/i18n';

const RumorsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AIPage' });
  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <SubTitle text={t('title')} />
      <div className="mt-6 whitespace-pre-line text-base">
        {t.rich('text', {
          issue: (text) => (
            <TextLink target="_blank" href="https://github.com/citizenweb3/validatorinfo/issues" content={text} />
          ),
        })}
      </div>
      <NotToday />
    </div>
  );
};

export default RumorsPage;

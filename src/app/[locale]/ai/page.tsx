import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import Story from '@/components/story';
import { NextPageWithLocale } from '@/i18n';

const RumorsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AIPage' });
  return (
    <div>
      <Story src="ai" alt="Pixelated, 90s game-style characters talking with a GPT-style AI caht bot" />
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
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

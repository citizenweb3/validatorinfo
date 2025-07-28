import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

import GetStakingList from '@/app/about/staking/get-staking-list';
import RichPageTitle from '@/components/common/rich-page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';

export const revalidate = 3600;

export default function StakingPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('AboutPage');

  return (
    <div>
      <Story src="staking" alt="Pixelated, 90s game-style characters stake on validator and mining pool rewards" />
      <TabList page="AboutPage" tabs={aboutTabs} />
      <RichPageTitle>
        <div className="m-4">
          {t.rich('Staking.title', {
            stakingCitizen: (chunks) => (
              <TextLink content={chunks} href="https://staking.citizenweb3.com/" target="_blank" />
            ),
          })}
        </div>
      </RichPageTitle>
      <SubDescription text={t('Staking.description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <SubTitle text="Networks" size="h2" />
      <GetStakingList />
    </div>
  );
}

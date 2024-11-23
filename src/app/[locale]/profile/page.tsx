import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {}

const NetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

  return (
    <div>
      <div className="m-4 whitespace-pre-line pt-2 text-base">{t('description')}</div>
      <div className="flex gap-8 border-b border-bgSt pb-2">
        <div className="">
          <SubTitle text={t('info')} />
          <div className="flex w-full gap-4">
            <Image src="/img/avatars/default.png" alt="avatar" width={62} height={58} className="mt-4 w-36" priority />
            <div className="mt-4 flex-grow text-lg">
              <div className="grid grid-cols-2">
                <div className="w-52 text-nowrap border-b border-r border-bgSt pb-3 pl-8 pr-4 pt-2 text-highlight">
                  {t('nick')}
                </div>
                <div className="text-nowrap border-b border-bgSt pb-3 pl-8 pr-4 pt-2">User1</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="text-nowrap border-b border-r border-bgSt py-3 pl-8 pr-4 text-highlight">
                  {t('additionalInfo')}
                </div>
                <div className="text-nowrap border-b border-bgSt py-3 pl-8 pr-4">info details</div>
              </div>
            </div>
          </div>
          <div className="mt-8 space-x-4 text-lg">
            <RoundedButton>{t('upload')}</RoundedButton>
            <RoundedButton>{t('submit')}</RoundedButton>
          </div>
        </div>
        <div className="flex-grow">
          <SubTitle text={t('activitySummary')} />
          <div className="mt-4 flex justify-between">
            <div className="bg-card mx-4 h-28 w-1/3">
              <div className="p-2.5 text-center text-base text-highlight">{t('daysVisited')}</div>
            </div>
            <div className="bg-card mx-4 h-28 w-1/3">
              <div className="p-2.5 text-center text-base text-highlight">{t('yoursFAv')}</div>
            </div>
            <div className="bg-card mx-4 h-28 w-1/3">
              <div className="p-2.5 text-center text-base text-highlight">{t('badgesReceived')}</div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="bg-card mx-4 h-28 w-1/3">
              <div className="p-2.5 text-center text-base text-highlight">{t('missionsCompleted')}</div>
            </div>
            <div className="bg-card mx-4 h-28 w-1/3">
              <div className="p-2.5 text-center text-base text-highlight">{t('rewardEarned')}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <SubTitle text={t('throneRoom')} />
      </div>
    </div>
  );
};

export default NetworksPage;

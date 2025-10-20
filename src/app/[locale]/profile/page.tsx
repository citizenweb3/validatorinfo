import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import LogoutButton from '@/components/common/logout-button';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {}

const ProfilePage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });

  return (
    <div>
      <div className="flex flex-row justify-between">
        <PageTitle text={t('title')} />
        <LogoutButton className="flex self-end text-xl" contentClassName="px-16">
          {t('Logout')}
        </LogoutButton>
      </div>
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="my-4 flex items-center justify-end space-x-8">
        <RoundedButton className="text-xl" contentClassName="px-16">
          {t('feedback')}
        </RoundedButton>
        <RoundedButton className="text-xl" contentClassName="px-16">
          {t('validatorBtn')}
        </RoundedButton>
      </div>
      <div className="flex gap-8 border-b border-bgSt pb-2">
        <div className="">
          <SubTitle text={t('info')} size="h1" />
          <div className="flex w-full gap-4">
            <Image src="/img/avatars/default.svg" alt="avatar" width={102} height={58} className="mt-2 w-44" priority />
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
          <div className="mt-4 space-x-4 text-lg">
            <RoundedButton>{t('upload')}</RoundedButton>
            <RoundedButton>{t('submit')}</RoundedButton>
          </div>
        </div>
        <div className="flex-grow mb-8">
          <SubTitle text={t('activitySummary')} size="h1" />
          <div className="mt-4 flex justify-between">
            <div className="mx-4 h-28 w-1/3 bg-card">
              <div className="p-2.5 text-center text-base text-highlight">{t('daysVisited')}</div>
            </div>
            <div className="mx-4 h-28 w-1/3 bg-card">
              <div className="p-2.5 text-center text-base text-highlight">{t('yoursFAv')}</div>
            </div>
            <div className="mx-4 h-28 w-1/3 bg-card">
              <div className="p-2.5 text-center text-base text-highlight">{t('badgesReceived')}</div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="mx-4 h-28 w-1/3 bg-card">
              <div className="p-2.5 text-center text-base text-highlight">{t('missionsCompleted')}</div>
            </div>
            <div className="mx-4 h-28 w-1/3 bg-card">
              <div className="p-2.5 text-center text-base text-highlight">{t('rewardEarned')}</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <SubTitle text={t('throneRoom')} size="h2" />
      </div>
    </div>
  );
};

export default ProfilePage;

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import NetworksCircle from '@/app/validators/[id]/(validator-profile)/validator-profile/validator-networks-circle';
import PodcastSummary from '@/app/validators/[id]/(validator-profile)/validator-profile/podcast-summary';
import PlusButton from '@/components/common/plus-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';

// Default Citizen Web3 podcast player, shown when a profile has no episode of its own (invites an
// interview via the "place your interview here" CTA). Shared so validators and pools stay in sync.
export const DEFAULT_PODCAST_PLAYER = 'https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark';

export interface ProfileBannerChain {
  name: string;
  logoUrl: string;
  prettyName: string;
}

export interface ProfileBannerPodcast {
  playerUrl: string;
  summary?: { summary: string; title: string; episodeUrl: string } | null;
  showInterviewCta: boolean;
}

interface OwnProps {
  locale: string;
  story: string;
  centerLogo: string;
  chains: ProfileBannerChain[];
  github?: string | null;
  // Optional — only profiles that have a podcast (validators) pass it; pools omit it.
  podcast?: ProfileBannerPodcast;
}

const iconsSize = 'h-10 min-h-10 w-10 min-w-10';

// Shared presentational profile banner (story + podcast? | NetworksCircle | Merits), reused by both the
// validator profile and the mining-pool profile. Labels live in the canonical ValidatorProfileHeader
// namespace; the entity-specific story is passed in already resolved.
const ProfileBanner: FC<OwnProps> = async ({ locale, story, centerLogo, chains, github, podcast }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorProfileHeader' });

  return (
    <div className="mb-7 mt-4 grid grid-cols-7 items-start">
      <div className="xl:mr-18 col-span-2 mr-8 flex h-full flex-col border-b border-bgSt md:mr-10 lg:mr-14 2xl:mr-20">
        <div className="font-sfpro text-base">
          <h2>{story}</h2>
          {podcast && (
            <>
              <div className="relative my-6 h-[40px] w-full md:h-[58px] lg:h-[66px] xl:h-[80px] 2xl:h-[86px]">
                <iframe
                  src={podcast.playerUrl}
                  className="m-0 origin-top-left scale-[0.20] p-0 md:scale-[0.30] lg:scale-[0.37] xl:scale-[0.42] 2xl:scale-[0.45]"
                  width="740"
                  height="200"
                ></iframe>
              </div>
              {podcast.summary && (
                <PodcastSummary
                  summary={podcast.summary.summary}
                  episodeTitle={podcast.summary.title}
                  episodeUrl={podcast.summary.episodeUrl}
                />
              )}
              {podcast.showInterviewCta && (
                <RoundedButton
                  href={''}
                  contentClassName="font-handjet text-sm px-5 pt-0 pb-0"
                  className="mb-4 active:mb-3"
                >
                  {t('place your interview here')}
                </RoundedButton>
              )}
            </>
          )}
        </div>
        <div className="mb-2 mt-auto flex items-center">
          <div className={`${iconsSize} bg-web bg-contain bg-no-repeat`} />
          <p className="text-xs">{t('Others Links')}</p>
          <PlusButton size="xs" isOpened={false} />
        </div>
      </div>
      <div className="col-span-3 h-full min-h-[250px] shadow-button">
        <NetworksCircle centerLogo={centerLogo} logos={chains} />
      </div>
      <div className="xl:ml-18 col-span-2 ml-8 h-full border-b border-bgSt md:ml-10 lg:ml-14 2xl:ml-20">
        <h1>
          <span className="border-b border-bgSt px-2.5 text-xl text-highlight">{t('Merits')}</span>
        </h1>
        <div className="mt-7 flex items-center">
          <Tooltip tooltip={t('eco tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-eco bg-contain bg-no-repeat hover:bg-eco_h`} />
          </Tooltip>
          <Tooltip tooltip={t('keyhole tooltip')} direction={'bottom'}>
            <div className={`${iconsSize} ml-2.5 bg-keyhole bg-contain bg-no-repeat hover:bg-keyhole_h`} />
          </Tooltip>
          {github && (
            <Tooltip noWrap tooltip={github} direction={'bottom'}>
              <Link href={github} target="_blank">
                <div className={`${iconsSize} ml-2.5 bg-github_g bg-contain bg-no-repeat hover:bg-github_g_h`} />
              </Link>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;

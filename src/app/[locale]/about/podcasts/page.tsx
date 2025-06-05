import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import SpreadModal from '@/app/about/modals/spread-modal';
import Player from '@/app/about/podcasts/player';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { Locale } from '@/i18n';
import SubDescription from '@/components/sub-description';
import TextLink from '@/components/common/text-link';
import RichPageTitle from '@/components/common/rich-page-title';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PodcastPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('AboutPage');

  return (
    <div>
      <Story src="podcast" alt="Pixelated, 90s game-style characters recording the Citizen Web3 podcast together" />
      <TabList page="AboutPage" tabs={aboutTabs} />
      <RichPageTitle>
        <div className="m-4">
          {t.rich('Podcast.title', {
            citizenLink: (chunks) => <TextLink content={chunks} href="https://www.citizenweb3.com/"/>,
          })}
        </div>
      </RichPageTitle>
      <div>
        <SubDescription text={t('Podcast.description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
        <div className="m-4">
          <Player />
        </div>
        <div className="mt-4 pt-2 text-base">
          <SubTitle text={t('Podcast.Subscribe')} size="h2" />
          <div className="my-8 flex space-x-14">
            <RoundedButton href="https://www.citizenweb3.com/rss" target="_blank">
              CW3 RSS Feed
            </RoundedButton>
            <SpreadModal />
          </div>
          {t('Podcast.SubscribeOtherHint')}
          <div className="mt-4 flex flex-row flex-wrap space-y-2">
            <Link href="https://podcasters.amazon.com/podcasts/bbdd140b-db4a-443d-bac4-680e57d2dcd5" target="_blank">
              <Image
                src="/img/icons/podcast-apps/amazon.png"
                alt="amazon"
                width={273}
                height={72}
                className="mt-2 h-auto w-24"
              />
            </Link>
            <Link href="https://podcasts.apple.com/podcast/citizen-web3/id1510241147" target="_blank">
              <Image
                src="/img/icons/podcast-apps/apple.png"
                alt="apple"
                width={270}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://castbox.fm/channel/id5763464" target="_blank">
              <Image
                src="/img/icons/podcast-apps/castbox.png"
                alt="castbox"
                width={273}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://castro.fm/podcast/879a0b01-fbbd-4fbb-9543-67b22cdecc1e" target="_blank">
              <Image
                src="/img/icons/podcast-apps/castro.png"
                alt="castro"
                width={270}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://overcast.fm/itunes1510241147/" target="_blank">
              <Image
                src="/img/icons/podcast-apps/google.png"
                alt="google"
                width={273}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://www.iheart.com/podcast/269-citizen-web3-77348233/" target="_blank">
              <Image
                src="/img/icons/podcast-apps/iheart.png"
                alt="iheart"
                width={270}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://overcast.fm/itunes1510241147/" target="_blank">
              <Image
                src="/img/icons/podcast-apps/overcast.png"
                alt="overcast"
                width={273}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://pca.st/g9vkfbgu" target="_blank">
              <Image
                src="/img/icons/podcast-apps/pocket.png"
                alt="pocket"
                width={270}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://radiopublic.com/citizen-web3-GmyKQN" target="_blank">
              <Image
                src="/img/icons/podcast-apps/public.png"
                alt="public"
                width={273}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://open.spotify.com/show/4pwsjBsgY1C5XCyRoslbSn" target="_blank">
              <Image
                src="/img/icons/podcast-apps/spotify.png"
                alt="spotify"
                width={270}
                height={72}
                className="h-auto w-24"
              />
            </Link>
            <Link href="https://tunein.com/podcasts/Technology-Podcasts/Citizen-Web3-p1350473/" target="_blank">
              <Image
                src="/img/icons/podcast-apps/tunein.png"
                alt="tunein"
                width={273}
                height={72}
                className="h-auto w-24"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import PartnerItem from '@/app/about/partners/partner-item';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const partners = [
  [
    { title: 'Citizen Web3', icon: '/img/icons/partners/cw3.png', link: 'https://www.citizenweb3.com/' },
    { title: 'Web3 Society', icon: '/img/icons/partners/web3c.png', link: 'https://t.me/web_3_society' },
    { title: 'Bro n Bro', icon: '/img/icons/partners/bro-n-bro.png', link: 'https://bronbro.io/' },
    { title: 'Cyber Academy', icon: '/img/icons/partners/ca.png', link: 'https://cyberacademy.dev/' },
  ],
  [
    { title: 'BVC', icon: '/img/icons/partners/bvc.png', link: 'https://bvc.citizenweb3.com' },
    { title: 'White Hacker', icon: '/img/icons/partners/wh.png', link: 'https://t.me/WhiteHackerRu' },
    { title: 'Voting Power', icon: '/img/icons/partners/vp.png', link: 'https://votingpower.org/' },
  ],
];

const Partners: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  unstable_setRequestLocale(locale);
  return (
    <div>
      <Story src="partners" alt="Pixelated, 90s game-style characters partner up and exchanging consensus" />
      <TabList page="AboutPage" tabs={aboutTabs} />
      <PageTitle text={t('Partners.title')} />
      <div className="">
        <div className="mt-20">
          {partners.map((partnerList, index) => (
            <div className="mt-20 flex w-full items-center justify-center" key={index}>
              {partnerList.map((partner) => (
                <div key={partner.link} className="mx-[5%] flex w-[10%] items-center justify-center">
                  <PartnerItem title={partner.title} link={partner.link} icon={partner.icon} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;

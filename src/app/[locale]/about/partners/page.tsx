import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import PartnerItem from '@/app/about/partners/partner-item';
import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

const partners = [
  [
    { title: 'Citizen Web3', icon: '/img/icons/partners/cw3.png', link: 'https://www.citizenweb3.com/' },
    { title: 'Web3 Society', icon: '/img/icons/partners/web3c.png', link: 'https://t.me/web_3_society' },
    { title: 'Posthuman', icon: '/img/icons/partners/posthuman.png', link: 'https://posthuman.digital/' },
    { title: 'Bro n Bro', icon: '/img/icons/partners/bro-n-bro.png', link: 'https://bronbro.io/' },
    { title: 'Cyber', icon: '/img/icons/partners/cyber.png', link: 'https://cyb.ai/' },
  ],
  [
    { title: 'Cyber Academy', icon: '/img/icons/partners/ca.png', link: 'https://cyberacademy.dev/' },
    { title: 'BVC', icon: '/img/icons/partners/bvc.png', link: 'https://t.me/web_3_society' },
    { title: 'White Hacker', icon: '/img/icons/partners/wh.png', link: 'https://t.me/WhiteHackerRu' },
    { title: 'Voting Power', icon: '/img/icons/partners/vp.png', link: 'https://votingpower.org/' },
  ],
];

const Partners: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  unstable_setRequestLocale(locale);
  return (
    <div>
      <div className="flex flex-shrink">
        <div className="flex flex-col">
          <PageTitle prefix="About" text="Validator Info" />
          <Story src="partners" />
        </div>
        <div className="flex-grow" />
      </div>
      <TabList page="AboutPage" tabs={aboutTabs} />
      <div className="">
        <SubTitle text={t('Tabs.Partners')} />
        <div className="mt-20">
          {partners.map((partnerList, index) => (
            <div className={`${index % 2 ? 'ml-[10%]' : ''} flex w-full items-center justify-start`} key={index}>
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

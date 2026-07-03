import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import PartnerItem from '@/app/about/partners/partner-item';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';
import TextLink from '@/components/common/text-link';
import RichPageTitle from '@/components/common/rich-page-title';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const partners = [
  [
    { title: 'Citizen Web3', icon: '/img/icons/partners/cw3.png', link: 'https://www.citizenweb3.com/' },
    { title: 'Web3 Society', icon: '/img/icons/partners/web3c.png', link: 'https://t.me/web_3_society' },
    { title: 'Bro n Bro', icon: '/img/icons/partners/bro-n-bro.png', link: 'https://bronbro.io/' },
    { title: 'Cyber Academy', icon: '/img/icons/partners/ca.png', link: 'https://cyberacademy.dev/' },
    { title: 'B.V.C.', icon: '/img/icons/partners/bvc.png', link: 'https://bvc.citizenweb3.com' },
  ],
];

const Partners: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  unstable_setRequestLocale(locale);
  return (
    <div>
      <TabList page="AboutPage" tabs={aboutTabs} />
      <RichPageTitle>
        <div className="m-4">
          {t.rich('Partners.title', {
            citizenLink: (chunks) => <TextLink content={chunks} href="https://www.citizenweb3.com/" target="_blank" />,
          })}
        </div>
      </RichPageTitle>
      <SubDescription text={t('Partners.description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mt-10">
        {partners.map((partnerList, index) => (
          <div
            className="mb-20 grid w-full grid-cols-2 gap-y-10 px-4 md:flex md:items-center md:justify-center md:gap-y-0 md:px-0"
            key={index}
          >
            {partnerList.map((partner) => (
              <div
                key={partner.link}
                className="flex items-center justify-center md:mx-[5%] md:w-[10%]"
              >
                <PartnerItem title={partner.title} link={partner.link} icon={partner.icon} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partners;

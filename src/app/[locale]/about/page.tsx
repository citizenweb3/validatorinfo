import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import OurManifestoModal from '@/app/about/modals/our-manifesto-modal';
import OurToolsModal from '@/app/about/modals/our-tools-modal';
import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import TextLink from '@/components/common/text-link';
import { Locale } from '@/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return {
    title: t('Metadata.title'),
  };
}

export default function AboutPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('AboutPage');

  return (
    <div>
      <div className="flex flex-shrink">
        <div className="flex flex-col">
          <PageTitle prefix="About" text="Validator Info" />
          <Story src="about" />
        </div>
        <div className="flex-grow" />
      </div>
      <TabList page="AboutPage" tabs={aboutTabs} />
      <div>
        <SubTitle text={t('title')} />
        <div className="m-4 w-2/3 whitespace-pre-line pt-2 text-base">
          {t.rich('description', {
            homeLink: (chunks) => <TextLink content={chunks} href="/" />,
            citizenLink: (chunks) => <TextLink content={chunks} href="https://www.citizenweb3.com/" target="_blank" />,
            xLink: (chunks) => <TextLink content={chunks} href="https://x.com/therealvalinfo" target="_blank" />,
            ghLink: (chunks) => (
              <TextLink content={chunks} href="https://github.com/citizenweb3/validatorinfo" target="_blank" />
            ),
            stakingLink: (chunks) => (
              <TextLink content={chunks} href="https://www.citizenweb3.com/staking" target="_blank" />
            ),
          })}
        </div>
        <div className="flex flex-row space-x-32">
          <div>
            <OurToolsModal />
          </div>
          <div>
            <OurManifestoModal />
          </div>
        </div>
        <div className="relative mt-9 h-10 bg-bgSt">
          <Image
            src="/img/icons/green-man.png"
            alt="green man"
            width={780}
            height={1104}
            className="absolute bottom-3 right-10 w-60"
          />
        </div>
      </div>
    </div>
  );
}

import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import OurManifestoModal from '@/app/about/modals/our-manifesto-modal';
import OurToolsModal from '@/app/about/modals/our-tools-modal';
import SubTitle from '@/components/common/sub-title';
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
      <SubTitle text={t('Useful Info')} />
      <div className="mt-4 whitespace-pre-line border-b border-bgSt py-4 text-base">{t('description')}</div>
      <div className="flex flex-row space-x-32">
        <div>
          <SubTitle text={t('Our tools')} size="h3" />
          <OurToolsModal />
        </div>
        <div>
          <SubTitle text={t('Our Manifesto')} size="h3" />
          <OurManifestoModal />
        </div>
      </div>
    </div>
  );
}

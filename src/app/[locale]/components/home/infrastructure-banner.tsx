import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const InfrastructureBanner = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="grid min-w-0 gap-3 2xl:grid-cols-2 2xl:items-center 2xl:gap-x-10">
      <div
        className="min-w-0 flex-1 border-b border-bgSt bg-table_row px-6 py-6 font-sfpro text-5xl font-light tracking-normal text-white/70 shadow-button hover:bg-bgHover sm:px-5 sm:py-4 sm:text-3xl md:px-4 md:py-3 md:text-base">
        {t('infrastructureText')}
      </div>
      <Link
        href="https://staking.citizenweb3.com"
        target="_blank"
        rel="noreferrer"
        className="flex h-32 items-center justify-center whitespace-nowrap border border-bgSt bg-card px-6 font-handjet text-5xl font-medium tracking-normal hover:text-highlight shadow-menu-button-rest transition hover:bg-card hover:shadow-menu-button-hover active:border-transparent active:bg-card active:shadow-menu-button-pressed sm:h-20 sm:text-3xl md:h-14 md:px-12 md:text-lg 2xl:w-80 2xl:justify-self-end"
      >
        {t('cashbackBanner')}
      </Link>
    </section>
  );
};

export default InfrastructureBanner;

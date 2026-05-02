import { getTranslations } from 'next-intl/server';

const TopPerformers = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="min-w-0 border border-bgSt bg-table_row shadow-button">
      <div className="px-6 pb-5 pt-4 sm:px-4 sm:pb-3 sm:pt-2 md:px-4 md:pb-3 md:pt-2">
        <div className="inline-flex border-b border-bgSt pb-1 pr-5">
          <h2 className="font-handjet text-5xl font-medium tracking-normal text-highlight sm:text-3xl md:text-xl">{t('topPerformers')}</h2>
        </div>
      </div>

      <div className="flex max-h-[60rem] flex-col overflow-y-auto sm:max-h-[40rem] md:max-h-[24rem]">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="flex h-20 shrink-0 items-center gap-5 border-t border-bgSt px-6 hover:bg-bgHover last:border-b last:border-bgSt sm:h-14 sm:gap-4 sm:px-4 md:h-10 md:gap-5 md:px-3.5"
          >
            <span className="h-10 w-10 rounded-full border border-white/40 bg-white/80 sm:h-7 sm:w-7 md:h-5 md:w-5" aria-hidden />
            <span className="font-sfpro text-5xl font-light tracking-normal text-white/90 sm:text-2xl md:text-base">
              {t('placeholderName')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopPerformers;

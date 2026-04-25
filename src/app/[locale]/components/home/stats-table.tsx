import { getTranslations } from 'next-intl/server';

import ecosystemService from '@/services/ecosystem-service';
import HeaderInfoService from '@/services/headerInfo-service';
import MetricPair from '@/components/home/metic-pair';


const StatsTable = async () => {
  const t = await getTranslations('HomePage');
  const [headerInfo, ecosystems] = await Promise.all([
    HeaderInfoService.getValidatorsAndChains(),
    ecosystemService.getAll(),
  ]);

  const metricPairs = [
    {
      label: t('stats.validators'),
      value: headerInfo.validators.toLocaleString(),
      href: '/validators',
    },
    {
      label: t('stats.claimedPages'),
      value: t('stats.claimedPagesValue'),
      href: '',
    },
    {
      label: t('stats.networks'),
      value: headerInfo.chains.toLocaleString(),
      href: '/networks',
    },
    {
      label: t('stats.ecosystems'),
      value: ecosystems.length.toLocaleString(),
      href: '/ecosystems',
    },
  ];

  const dominanceItems = ['pow', 'cosmos', 'eth', 'polkadot'] as const;

  return (
    <section className="min-w-0">
      <div className="grid min-w-0 gap-x-10 2xl:grid-cols-2">
        {metricPairs.map((pair) => (
          <MetricPair
            key={pair.label + pair.value}
            label={pair.label}
            value={pair.value}
            href={pair.href}
          />
        ))}
      </div>

      <div
        className="tvl-page-jump mt-2 flex w-full flex-col bg-table_row text-left transition-all duration-75 hover:bg-bgHover 2xl:flex-row"
      >
        <div
          className="flex min-h-24 cursor-pointer items-center border-b border-bgSt py-7 pl-7 pr-4 font-sfpro text-5xl sm:min-h-16 sm:py-5 sm:pl-5 sm:text-3xl md:min-h-16 md:py-5 md:pl-10 md:pr-3 md:text-lg 2xl:w-32 2xl:border-r">
          {t('stats.tvl')}
        </div>
        <div
          className="flex min-h-24 min-w-0 flex-1 flex-col gap-5 border-b border-bgSt py-7 pl-7 pr-5 sm:min-h-16 sm:gap-3 sm:py-5 sm:pl-5 md:min-h-16 md:py-5 md:pl-6 md:pr-4 2xl:flex-row 2xl:items-center">
          <span
            className="font-handjet text-5xl sm:text-3xl md:text-lg hover:text-highlight">{t('stats.tvlValue')}</span>
          <div
            className="flex min-w-0 flex-wrap items-center justify-center gap-x-7 gap-y-3 text-center sm:gap-y-2 2xl:flex-1">
            <span className="font-sfpro text-5xl sm:text-3xl md:text-lg mr-10">{t('stats.dominance')}</span>
            {dominanceItems.map((item) => (
              <span key={item} className="font-handjet text-5xl sm:text-3xl md:text-lg px-10 hover:text-highlight">
                {t(`stats.${item}`)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsTable;

import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsListModal from '@/app/validators/[identity]/metrics/metrics-list-modal';
import { validatorExample } from '@/app/validators/[identity]/validatorExample';

interface OwnProps {}

const MetricsList: FC<OwnProps> = async () => {
  const t = await getTranslations('ValidatorMetricsPage');

  const cardClass = `
  flex flex-col items-center bg-card pt-2.5 
  min-w-[200px] max-w-[280px] flex-1 
  md:max-w-[200px] 
  lg:max-w-[200px] 
  xl:max-w-[230px] 
  2xl:max-w-[250px]
`;

  return (
    <div className="mt-12 flex flex-col items-center gap-8">
      <div className="flex w-full justify-center gap-8">
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('technical score')}</div>
          <div className="mt-3 font-handjet text-lg">{validatorExample.metrics.technicalScore}</div>
          <MetricsListModal formulaUrl={'/img/tmp/formula.svg'} title={t('explanation')} />
        </div>
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('social score')}</div>
          <div className="mt-3 font-handjet text-lg">{validatorExample.metrics.socialScore}</div>
          <MetricsListModal formulaUrl={'/img/tmp/formula.svg'} title={t('explanation')} />
        </div>
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('governance score')}</div>
          <div className="mt-3 font-handjet text-lg">{validatorExample.metrics.governanceScore}</div>
          <MetricsListModal formulaUrl={'/img/tmp/formula.svg'} title={t('explanation')} />
        </div>
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('user score')}</div>
          <div className="mt-3 font-handjet text-lg">{validatorExample.metrics.userScore}</div>
          <MetricsListModal formulaUrl={'/img/tmp/formula.svg'} title={t('explanation')} />
        </div>
      </div>
      <div className="flex w-full justify-center gap-8">
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('TVS')}</div>
          <div className="mt-3 font-handjet text-lg">${validatorExample.metrics.TVS}</div>
        </div>
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('fans')}</div>
          <div className="mt-3 font-handjet text-lg">{validatorExample.metrics.fans.toLocaleString('en-Us')}</div>
        </div>
        <div className={cardClass}>
          <div className="text-center text-base text-highlight">{t('amount of assets')}</div>
          <div className="mt-3 font-handjet text-lg">{validatorExample.metrics.amountOfAssets}</div>
          <MetricsListModal formulaUrl={'/img/tmp/formula.svg'} title={t('explanation')} />
        </div>
      </div>
    </div>
  );
};

export default MetricsList;

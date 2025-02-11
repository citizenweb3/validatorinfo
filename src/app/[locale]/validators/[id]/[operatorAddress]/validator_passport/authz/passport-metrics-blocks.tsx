import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  node?: validatorNodesWithChainData | undefined;
}

const PassportMetricsBlocks: FC<OwnProps> = async ({ node }) => {
  const t = await getTranslations('ValidatorPassportPage');

  if (!node) {
    return null;
  }

  const tokenDelegatorShares = Number(node.delegatorShares) / 10 ** node.coinDecimals;

  const cardClass = `
  flex flex-col items-center bg-card pt-2.5 pb-3 
  flex-1
  xs:max-w-[100px]
  sm:max-w-[130px]
  md:max-w-[150px] 
  lg:max-w-[180px] 
  xl:max-w-[200px] 
  2xl:max-w-[250px]
`;
  const cardTitleClass = 'text-center text-base text-highlight';
  const cardValueClass = 'my-3 font-handjet text-lg';

  return (
    <div className="mt-16 flex flex-col items-center gap-8">
      <div className="flex w-full justify-center gap-8">
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('commission')}</div>
          <div className={cardValueClass}>{Math.trunc(Number(node.rate) * 100)}%</div>
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('tokens delegated')}</div>
          <div className={cardValueClass}>
            {`${tokenDelegatorShares.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${node.denom}`}
          </div>
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('expected APR')}</div>
          <div className={cardValueClass}>12.5%</div>
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('outstanding reward')}</div>
          <div className={cardValueClass}>$12.56K</div>
        </div>
      </div>
      <div className="flex w-full justify-center gap-8">
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('voting power')}</div>
          <div className={cardValueClass}>4%</div>
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('validator rank')}</div>
          <div className={cardValueClass}>17</div>
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('proposals created')}</div>
          <div className={cardValueClass}>2</div>
        </div>
      </div>
    </div>
  );
};

export default PassportMetricsBlocks;

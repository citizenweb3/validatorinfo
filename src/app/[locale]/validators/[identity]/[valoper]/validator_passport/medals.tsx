import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {
  locale: string;
}

const Medals: FC<OwnProps> = async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const iconsSize = 'h-20 min-h-20 w-20 min-w-20';

  return (
    <>
      <SubTitle text={t('Medals')} />
      <div className="mt-7 flex items-center gap-10">
        <Tooltip className="text-nowrap" tooltip={t('restake tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} hover:bg-restake_h bg-restake ml-2.5 bg-contain bg-no-repeat`} />
        </Tooltip>
        <Tooltip className="text-nowrap" tooltip={t('horcrux tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-horcrux hover:bg-horcrux_h ml-2.5 bg-contain bg-no-repeat`} />
        </Tooltip>
        <Tooltip className="text-nowrap" tooltip={t('slashed tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} hover:bg-slashed_h bg-slashed ml-2.5 bg-contain bg-no-repeat`} />
        </Tooltip>
        <Tooltip className="text-nowrap" tooltip={t('hash txs tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-hash_txs hover:bg-hash_txs_h ml-2.5 bg-contain bg-no-repeat`} />
        </Tooltip>
        <Tooltip className="text-nowrap" tooltip={t('reward reinvesting tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} hover:bg-reward_re_h bg-reward_re ml-2.5 bg-contain bg-no-repeat`} />
        </Tooltip>
      </div>
    </>
  );
};

export default Medals;

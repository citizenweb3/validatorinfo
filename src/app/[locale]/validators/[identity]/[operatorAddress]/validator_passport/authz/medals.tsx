import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  locale: string;
}

const Medals: FC<OwnProps> = async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const iconsSize = 'h-24 min-h-24 w-24 min-w-24 bg-contain bg-no-repeat ml-3';

  return (
    <div>
      <SubTitle text={t('Medals')} />
      <div className="mt-6 flex items-center gap-10">
        <Tooltip noWrap tooltip={t('restake tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-restake hover:bg-restake_h `} />
        </Tooltip>
        <Tooltip noWrap tooltip={t('horcrux tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-horcrux hover:bg-horcrux_h`} />
        </Tooltip>
        <Tooltip noWrap tooltip={t('slashed tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-slashed hover:bg-slashed_h`} />
        </Tooltip>
        <Tooltip noWrap tooltip={t('hash txs tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-hash_txs hover:bg-hash_txs_h`} />
        </Tooltip>
        <Tooltip noWrap tooltip={t('reward reinvesting tooltip')} direction={'bottom'}>
          <div className={`${iconsSize} bg-reward_re hover:bg-reward_re_h`} />
        </Tooltip>
      </div>
    </div>
  );
};

export default Medals;

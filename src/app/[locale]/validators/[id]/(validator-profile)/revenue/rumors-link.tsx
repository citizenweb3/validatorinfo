import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { validatorExample } from '@/app/validators/[id]/(validator-profile)/validatorExample';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  id: number;
  locale: string;
}

const RumorsLink: FC<OwnProps> = async (id, locale) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorRevenuePage' });

  return (
    <div className="flex flex-col items-start pb-1 shadow-button">
      <h2 className="mb-1 self-end text-sm text-highlight">{t('p2pchat')}</h2>
      <div className="flex items-center space-x-4 pl-2 pr-6">
        <img src={validatorExample.icon} alt={validatorExample.name} className="max-h-14 max-w-14 rounded-full" />
        <div>
          <h3 className="mb-1 font-sfpro text-sm">CW3 NFT</h3>
          <p className="font-sfpro text-xs">Snapshot: ???</p>
          <p className="font-sfpro text-xs">{t('claim date')}: ???</p>
        </div>
      </div>
      <div className="mb-1 mt-4 flex justify-center self-stretch">
        <RoundedButton href={'/p2pchat'} className="font-handjet text-base">
          {t('read more')}
        </RoundedButton>
      </div>
    </div>
  );
};

export default RumorsLink;

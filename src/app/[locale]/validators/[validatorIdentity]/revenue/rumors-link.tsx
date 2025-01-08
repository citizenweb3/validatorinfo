import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  identity: string;
  locale: string;
}

const RumorsLink: FC<OwnProps> = async (identity, locale) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorRevenuePage' });

  return (
    <div className="flex flex-col items-start shadow-button">
      <h2 className="mb-2 self-end text-sm text-highlight">{t('rumors')}</h2>
      <div className="flex items-center space-x-4 px-4">
        <img src={validatorExample.icon} alt={validatorExample.name} className="max-h-14 max-w-14 rounded-full" />
        <div>
          <h3 className="font-sfpro text-base">CW3 NFT</h3>
          <p className="font-sfpro text-sm">Snapshot: ???</p>
          <p className="font-sfpro text-sm">{t('claim date')}: ???</p>
        </div>
      </div>
      <div className="mt-4 mb-1 flex justify-center self-stretch">
        <RoundedButton href={'/rumors'} className="font-handjet text-base">{t('read more')}</RoundedButton>
      </div>
    </div>
  );
};

export default RumorsLink;

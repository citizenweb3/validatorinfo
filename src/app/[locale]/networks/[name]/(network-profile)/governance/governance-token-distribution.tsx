import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

interface OwnProps {
}

const GovernanceTokenDistribution: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkGovernance');
  return (
    <div className="mt-20 flex items-center justify-between px-4 py-1 shadow-button mx-auto w-fit">
      <div className="font-sfpro text-lg">{t('governance token distribution')}:</div>
      <div className="ml-24 px-24 font-handjet text-xl text-highlight">$124.43K</div>
    </div>
  );
};

export default GovernanceTokenDistribution;
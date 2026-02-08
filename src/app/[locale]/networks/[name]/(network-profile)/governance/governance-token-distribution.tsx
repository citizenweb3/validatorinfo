import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

interface OwnProps {
}

const GovernanceTokenDistribution: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkGovernance');
  return (
    <div className="flex items-center justify-between px-4 py-1 bg-table_row self-center">
      <div className="font-sfpro text-base">{t('governance token distribution')}:</div>
      <div className="ml-10 px-16 font-handjet text-xl text-highlight">$124.43K</div>
    </div>
  );
};

export default GovernanceTokenDistribution;
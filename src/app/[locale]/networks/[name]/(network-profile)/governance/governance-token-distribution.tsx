import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

interface OwnProps {
}

const GovernanceTokenDistribution: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkGovernance');
  return (
    <div className="my-16 flex w-fit items-center border border-bgSt bg-table_row px-6 py-3 blur-sm pointer-events-none">
      <div className="font-sfpro text-lg">{t('governance token distribution')}:</div>
      <div className="ml-16 font-handjet text-xl text-highlight">$124.43K</div>
    </div>
  );
};

export default GovernanceTokenDistribution;
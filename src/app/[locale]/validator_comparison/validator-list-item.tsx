import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC } from 'react';

import { ValidatorDataFilled } from '@/app/validator_comparison/get-validator-data';
import ValidatorItemRow from '@/app/validator_comparison/validator-item-row';
import Button from '@/components/common/button';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  item: ValidatorDataFilled;
  chartType: string | undefined;
}

const ValidatorListItem: FC<OwnProps> = ({ item, chartType }) => {
  const t = useTranslations('ComparisonPage');
  return (
    <div className="flex max-w-96 flex-grow flex-col">
      <ValidatorItemRow className="!min-h-20 border-b border-bgSt text-highlight">
        {' '}
        <Button className="relative z-20 mr-4 h-16 w-7">
          <div className={`min-h-8 min-w-8 bg-star bg-contain`} />
        </Button>
        <div className="overflow-x-hidden text-ellipsis text-nowrap">{item.moniker}</div>
      </ValidatorItemRow>
      <div className="flex max-h-20 min-h-14 flex-grow items-center justify-center">
        <RoundedButton contentClassName="text-lg px-16">{t('Profile')}</RoundedButton>
      </div>
      <ValidatorItemRow className={`text-${item.healthChange.color}`}>{item.healthChange.value}%</ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.technicalScoreChanges.color}`}>
        {item.technicalScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.TVSGovernanceScoreChanges.color}`}>
        {item.TVSGovernanceScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.userScoreChanges.color}`}>
        {item.userScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.socialScoreChanges.color}`}>
        {item.socialScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.badges.color}`}>{item.badges.value}</ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.reviews.color}`}>{item.reviews.value}</ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.tagsInTheWild.color}`}>{item.tagsInTheWild.value}</ValidatorItemRow>
      <ValidatorItemRow>
        {chartType ? <Image src="/img/charts/comparison.png" alt="chart" width={356} height={97} /> : '00'}
      </ValidatorItemRow>
      <ValidatorItemRow>
        {chartType ? <Image src="/img/charts/comparison.png" alt="chart" width={356} height={97} /> : '00'}
      </ValidatorItemRow>
    </div>
  );
};

export default ValidatorListItem;

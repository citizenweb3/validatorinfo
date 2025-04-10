import { useTranslations } from 'next-intl';
import { FC } from 'react';

import ValidatorItemRow from '@/app/comparevalidators/validator-item-row';

interface OwnProps {
  isChart: boolean;
}

const ValidatorLeftPanel: FC<OwnProps> = ({ isChart }) => {
  const t = useTranslations('ComparisonPage');
  return (
    <div className="flex max-w-96 flex-grow flex-col">
      <ValidatorItemRow left className="!min-h-20 border-b border-bgSt font-bold">
        {t('Choose Providers')}
      </ValidatorItemRow>
      <ValidatorItemRow left>{t('Health Change')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('Technical Score Changes')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('TVS Governance Score Changes')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('User Score Changes')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('Social Score Changes')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('Badges')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('Reviews')}</ValidatorItemRow>
      <ValidatorItemRow left>{t('Tags # in the Wild')}</ValidatorItemRow>
      {isChart && <ValidatorItemRow left>{t('TVS Growth')}</ValidatorItemRow>}
      {isChart && <ValidatorItemRow left>{t('Fan Growth')}</ValidatorItemRow>}
    </div>
  );
};

export default ValidatorLeftPanel;

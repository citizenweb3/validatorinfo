import {getTranslations} from 'next-intl/server';
import {FC} from 'react';

import MetricsBlocksModal from '@/app/validators/[id]/(validatorProfile)/metrics/metrics-blocks/metrics-blocks-modal';
import ToolTip from '@/components/common/tooltip';

interface OwnProps {
}

const NetworkHeaderMetricsBlocks: FC<OwnProps> = async ({}) => {
    const t = await getTranslations('NetworkProfileHeader');

    const cardClass = `
    flex flex-col items-center bg-card
    shrink-0 
    xs:w-[100px]
    sm:w-[130px]
    md:w-[150px] 
    lg:w-[180px] 
    xl:w-[200px] 
    2xl:w-[250px]
  `;
    const cardTitleClass = 'text-center text-base text-highlight';
    const cardValueClass = 'font-handjet text-lg';

    return (
        <div className="mt-16 flex w-full justify-center gap-6">
            <ToolTip tooltip={t('tvl tooltip')} direction={'top'}>
                <div className={cardClass}>
                    <div className={cardTitleClass}>TVL</div>
                    <div className={cardValueClass}>90</div>
                    <MetricsBlocksModal/>
                </div>
            </ToolTip>
            <ToolTip tooltip={t('revenue tooltip')} direction={'top'}>
                <div className={cardClass}>
                    <div className={cardTitleClass}>{t('Revenue')}</div>
                    <div className={cardValueClass}>90</div>
                    <MetricsBlocksModal/>
                </div>
            </ToolTip>
            <ToolTip tooltip={t('validator cost tooltip')} direction={'top'}>
                <div className={cardClass}>
                    <div className={cardTitleClass}>{t('Validator Cost')}</div>
                    <div className={cardValueClass}>90</div>
                    <MetricsBlocksModal/>
                </div>
            </ToolTip>
        </div>
    );
};

export default NetworkHeaderMetricsBlocks;

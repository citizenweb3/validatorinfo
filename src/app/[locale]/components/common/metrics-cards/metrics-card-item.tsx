import { FC } from 'react';
import { validatorNodesWithChainData } from '@/services/validator-service';
import MetricsCardsModal from '@/components/common/metrics-cards/metrics-cards-modal';
import { Size } from '@/components/common/plus-button';

interface OwnProps {
  title: string;
  data: number | string;
  isPercents?: boolean;
  isModal?: boolean;
  modalTitle?: string;
  modalItem?: string | validatorNodesWithChainData[];
  plusButtonSize?: Size;
  className?: string;
  titleClassName?: string;
  dataClassName?: string;
  addLineData?: string;
  addLineClassName?: string;
}

const MetricsCardItem: FC<OwnProps> = ({
    title,
    data,
    isPercents = false,
    isModal = false,
    modalTitle = '',
    modalItem = '',
    plusButtonSize = 'sm',
    className = '',
    titleClassName = '',
    dataClassName = '',
    addLineData = '',
    addLineClassName = '',
  }) => {
  return (
    <div className={`${className}     
      flex flex-col items-center bg-card mx-1
      xs:w-[100px]
      sm:w-[130px]
      md:w-[150px] 
      lg:w-[180px] 
      xl:w-[200px] 
      2xl:w-[270px]`
    }>
      <div className={`${titleClassName} text-center text-base text-highlight`}>{title}</div>
      <div className={`${dataClassName} font-handjet text-lg`}>{isPercents ? `${data}%` : data}</div>
      {addLineData && <div className={`${addLineClassName}`}>{addLineData}</div>}
      {isModal && (
        <MetricsCardsModal
          title={modalTitle}
          list={Array.isArray(modalItem) ? modalItem : undefined}
          item={!Array.isArray(modalItem) ? String(modalItem) : undefined}
          plusButtonSize={plusButtonSize}
        />
      )}
    </div>
  );
};

export default MetricsCardItem;

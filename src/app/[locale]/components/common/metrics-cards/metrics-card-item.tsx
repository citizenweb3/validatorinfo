import { FC } from 'react';
import { validatorNodesWithChainData } from '@/services/validator-service';
import MetricsCardsModal from '@/components/common/metrics-cards/metrics-cards-modal';

interface OwnProps {
  title: string;
  data: number | string;
  isPercents?: boolean;
  isModal?: boolean;
  modalTitle?: string;
  modalItem?: string | validatorNodesWithChainData[];
  className?: string;
  titleClassName?: string;
  dataClassName?: string;
}

const MetricsCardItem: FC<OwnProps> = ({
                                         title,
                                         data,
                                         isPercents = false,
                                         isModal = false,
                                         modalTitle = '',
                                         modalItem = '',
                                         className = '',
                                         titleClassName = '',
                                         dataClassName = '',
                                       }) => {
  return (
    <div className={`${className}     
      flex flex-col items-center bg-card
      xs:w-[100px]
      sm:w-[130px]
      md:w-[150px] 
      lg:w-[180px] 
      xl:w-[200px] 
      2xl:w-[250px]`
    }>
      <div className={`${titleClassName} text-center text-base text-highlight`}>{title}</div>
      <div className={`${dataClassName} font-handjet text-lg`}>{isPercents ? `${data}%` : data}</div>
      {isModal && (
        <MetricsCardsModal
          title={modalTitle}
          list={Array.isArray(modalItem) ? modalItem : undefined}
          item={!Array.isArray(modalItem) ? String(modalItem) : undefined}
        />
      )}    </div>
  );
};

export default MetricsCardItem;

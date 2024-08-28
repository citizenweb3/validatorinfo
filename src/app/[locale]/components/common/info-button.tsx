import { FC } from 'react';

interface OwnProps {}

const InfoButton: FC<OwnProps> = () => {
  return <div className="bg-info hover:bg-info_h active:bg-info_a h-[1.375rem] w-[1.375rem] bg-contain" />;
};

export default InfoButton;

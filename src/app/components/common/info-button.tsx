import { FC } from 'react';

interface OwnProps {}

const InfoButton: FC<OwnProps> = ({}) => {
  return (
    <div className="h-[1.375rem] w-[1.375rem] bg-[url('/img/icons/info.svg')] bg-contain hover:bg-[url('/img/icons/info-h.svg')] active:bg-[url('/img/icons/info-a.svg')]" />
  );
};

export default InfoButton;

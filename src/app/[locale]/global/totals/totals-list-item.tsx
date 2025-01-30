import { FC } from 'react';

interface OwnProps {
  title: string;
  data: number;
}

const TotalsListItem: FC<OwnProps> = ({ title, data }) => {
  return (
    <div className="flex w-full flex-col items-center bg-card pb-6 pt-2.5">
      <div className="text-center text-base text-highlight">{title}</div>
      <div className="mt-5 font-handjet text-lg">{data}</div>
    </div>
  );
};

export default TotalsListItem;

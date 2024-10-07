import { FC } from 'react';

interface OwnProps {
  title: string;
  data: number;
}

const TotalsListItem: FC<OwnProps> = ({ title, data }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-base text-highlight">{title}</div>
      <div className="mt-5 font-handjet text-lg">{data}</div>
    </div>
  );
};

export default TotalsListItem;

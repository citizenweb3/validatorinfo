import { FC } from 'react';

const sizeItems = {
  h1: 'text-2xl py-5 px-6',
  h2: 'text-xl py-4 px-4',
  h3: 'text-lg py-3 px-4',
  h4: 'text-base py-2 px-3',
};

interface OwnProps {
  text: string;
  size?: keyof typeof sizeItems;
}

const SubTitle: FC<OwnProps> = ({ text, size = 'h2' }) => {
  return (
    <h2 className={`${sizeItems[size]} flex w-fit border-b border-bgSt pb-1 font-handjet text-highlight`}>{text}</h2>
  );
};

export default SubTitle;

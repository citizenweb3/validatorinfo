import { FC } from 'react';

const sizeItems = {
  h1: 'text-6xl py-5 px-6 sm:text-4xl md:text-3xl',
  h2: 'text-5xl py-4 px-4 sm:text-3xl md:text-xl',
  h3: 'text-4xl py-3 px-4 sm:text-2xl md:text-lg',
  h4: 'text-2xl py-2 px-3 sm:text-xl md:text-base',
};

interface OwnProps {
  text: string;
  size?: keyof typeof sizeItems;
  className?: string;
}

const SubTitle: FC<OwnProps> = ({ text, size = 'h2', className = '' }) => {
  return (
    <h2 className={`${sizeItems[size]} ${className} flex w-fit border-b border-bgSt pb-1 font-handjet text-highlight`}>
      {text}
    </h2>
  );
};

export default SubTitle;

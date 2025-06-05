import { FC, ReactNode } from 'react';

interface OwnProps {
  children: ReactNode;
}

const RichPageTitle: FC<OwnProps> = ({ children }) => {
  return (
    <h1 className="mt-4 flex w-fit border-b border-bgSt px-4 font-handjet text-4xl text-highlight">
      {children}
    </h1>
  );
};

export default RichPageTitle; 
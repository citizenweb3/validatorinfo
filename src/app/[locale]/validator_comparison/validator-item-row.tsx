import { FC, PropsWithChildren } from 'react';

interface OwnProps {
  left?: boolean;
  className?: string;
}

const ValidatorItemRow: FC<PropsWithChildren<OwnProps>> = ({ children, left = false, className = '' }) => (
  <div
    className={`${className} ${left ? 'justify-start' : 'justify-center'} flex max-h-20 min-h-20 flex-grow items-center px-8`}
  >
    {children}
  </div>
);

export default ValidatorItemRow;

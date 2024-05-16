import { FC, PropsWithChildren } from 'react';

interface OwnProps {
  onClick?: () => void;
  className?: string;
}

const Button: FC<PropsWithChildren<OwnProps>> = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`border-hover-secondary min-w-9 bg-gradient-to-b fill-black stroke-black p-px font-gothic ${className}`}
    >
      <div className="flex items-center justify-center bg-background px-2 py-1.5">{children}</div>
    </button>
  );
};

export default Button;

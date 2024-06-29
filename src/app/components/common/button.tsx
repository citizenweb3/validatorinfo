import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

interface OwnProps {
  component?: 'button' | 'link';
  href?: string;
  onClick?: () => void;
  className?: string;
}

const Button: FC<PropsWithChildren<OwnProps>> = ({ children, onClick, className = '', component = 'button', href }) => {
  const cn = `border-hover-secondary min-w-9 bg-gradient-to-b fill-black stroke-black p-px font-gothic ${className}`;
  const content = <div className="flex items-center justify-center bg-background px-2 py-1.5">{children}</div>;

  return component === 'link' ? (
    <Link href={href ?? '#'} className={cn}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} className={cn}>
      {content}
    </button>
  );
};

export default Button;

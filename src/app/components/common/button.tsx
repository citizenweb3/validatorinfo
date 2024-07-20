import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';

interface OwnProps {
  component?: 'button' | 'link';
  href?: string | UrlObject;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

const Button: FC<PropsWithChildren<OwnProps>> = ({
  children,
  onClick,
  className = '',
  component = 'button',
  href,
  isActive = false,
}) => {
  const cn =
    (isActive ? 'bg-gradient-to-r from-primary to-secondary ' : '') +
    `${className} group/button border-r border-t border-bgSt shadow-button hover:bg-bgSt hover:text-highlight hover:fill-highlight min-w-9 fill-black stroke-black p-px font-gothic active:mt-1 active:border-transparent active:bg-background active:shadow-none`;
  const content = (
    <div className="relative flex h-full items-center justify-center bg-background px-2 py-1.5 group-hover/button:bg-bgSt group-active/button:bg-background">
      {children}
    </div>
  );

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

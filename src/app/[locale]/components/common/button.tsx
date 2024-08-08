import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';

interface OwnProps {
  component?: 'button' | 'link';
  href?: string | UrlObject;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
  isActive?: boolean;
}

const Button: FC<PropsWithChildren<OwnProps>> = ({
  children,
  onClick,
  className = '',
  component = 'button',
  contentClassName = '',
  href,
  isActive = false,
}) => {
  const cn =
    (isActive
      ? 'bg-gradient-to-r from-primary to-secondary active:from-transparent active:to-transparent border-none text-highlight'
      : 'bg-background') +
    ` ${className} group/button border-r border-t border-bgSt shadow-button hover:bg-bgHover hover:text-highlight hover:fill-highlight min-w-9 fill-black stroke-black p-px active:mt-1 active:border-transparent active:bg-background active:shadow-none`;
  const content = (
    <div
      className={`${contentClassName} group-hover/button:bg-bgHover relative flex h-full items-center justify-center bg-background px-2 py-1.5 group-active/button:bg-background`}
    >
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

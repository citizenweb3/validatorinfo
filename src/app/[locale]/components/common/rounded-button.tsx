import { FC, PropsWithChildren } from 'react';
import type { UrlObject } from 'url';

import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  component?: 'button' | 'link';
  href?: string | UrlObject;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
  isActive?: boolean;
  tooltip?: string;
}

const RoundedButton: FC<PropsWithChildren<OwnProps>> = ({
  children,
  onClick,
  className = '',
  contentClassName = '',
  tooltip,
}) => {
  let content = (
    <div
      className={`${contentClassName} relative flex h-full items-center justify-center rounded-bl-full rounded-tr-full bg-background px-10 py-1.5 font-handjet group-hover/button:bg-bgHover group-active/button:bg-background`}
    >
      {children}
    </div>
  );

  if (tooltip) {
    content = <Tooltip tooltip={tooltip}>{content}</Tooltip>;
  }

  return (
    <button
      onClick={onClick}
      className={`${className} group/button min-w-9 rounded-bl-full rounded-tr-full border-r border-t border-none border-bgSt bg-gradient-to-r from-primary to-secondary fill-black stroke-black p-px text-highlight shadow-button hover:bg-bgHover hover:fill-highlight hover:text-white active:-mb-1 active:mt-1 active:shadow-none`}
    >
      {content}
    </button>
  );
};

export default RoundedButton;

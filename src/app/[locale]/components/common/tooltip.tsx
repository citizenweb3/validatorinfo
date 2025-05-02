'use client';

import { Placement } from '@popperjs/core';
import { FC, ReactNode, useState } from 'react';
import { usePopper } from 'react-popper';
import { twMerge } from 'tailwind-merge';

interface Props {
  children: ReactNode;
  tooltip: string;
  direction?: Placement;
  noWrap?: boolean;
  className?: string;
}

const ToolTip: FC<Props> = ({ children, tooltip, direction = 'bottom', noWrap = false, className = '' }) => {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, { placement: direction });
  const [isOpened, setIsOpened] = useState<boolean>(false);

  let timeout: NodeJS.Timeout | null = null;
  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsOpened(true), 700);
  };

  const baseStyle = 'pointer-events-none z-[999] min-w-32 bg-primary px-3 py-2 text-center font-light text-white shadow-button before:absolute before:left-0 before:right-0 before:z-[-1] before:mx-auto before:h-4 before:w-4 before:rotate-45 before:bg-primary';
  const tooltipClassName = twMerge(
    baseStyle,
    noWrap && 'text-nowrap',
    direction === 'top' ? 'mb-3 before:-bottom-1' : 'mt-3 before:-top-1',
    className
  );

  return (
    <div
      ref={setReferenceElement}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        if (timeout) {
          clearTimeout(timeout);
        }
        setIsOpened(false);
      }}
    >
      {tooltip && isOpened ? (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className={tooltipClassName}
        >
          {tooltip}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default ToolTip;

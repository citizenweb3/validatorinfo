import { FC, PropsWithChildren, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

interface OwnProps {
  title?: string;
  opened: boolean;
  onClose: () => void;
  className?: string;
  isRelative?: boolean;
}

const BaseModal: FC<PropsWithChildren<OwnProps>> = ({
  opened,
  children,
  onClose,
  className = '',
  isRelative = true,
  title = '',
}) => {
  const ref = useRef(null);
  useOnClickOutside(ref, () => onClose());
  return (
    <div className={`${opened ? 'block' : 'hidden'} ${isRelative ? 'relative' : ''}`}>
      <div className={`${className} absolute z-40 bg-background shadow-3xl`}>
        <div className="relative p-3 pt-6">
          <div
            className={`bg-close hover:bg-close_h active:bg-close_a absolute right-0 top-0 z-50 h-9 w-9 bg-contain`}
            onClick={onClose}
          />
          {title && <div className="ml-9 text-lg text-highlight">{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;

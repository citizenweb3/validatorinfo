import { FC, PropsWithChildren, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

interface OwnProps {
  title?: string;
  opened: boolean;
  onClose: () => void;
  className?: string;
  isRelative?: boolean;
  hideClose?: boolean;
}

const BaseModal: FC<PropsWithChildren<OwnProps>> = ({
  opened,
  children,
  onClose,
  className = '',
  isRelative = true,
  title = '',
  hideClose = false,
}) => {
  const ref = useRef(null);
  useOnClickOutside(ref, () => onClose());
  return (
    <div ref={ref} className={`${opened ? 'block' : 'hidden'} ${isRelative ? 'relative' : ''}`}>
      <div className={`${className} absolute z-40 bg-background shadow-3xl`}>
        <div className={`${!hideClose && 'pt-6'} relative p-3`}>
          {!hideClose && (
            <div
              className={`absolute right-0 top-0 z-50 h-9 w-9 bg-close bg-contain hover:bg-close_h active:bg-close_a`}
              onClick={onClose}
            />
          )}
          {title && <div className="ml-9 text-lg text-highlight">{title}</div>}
          <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;

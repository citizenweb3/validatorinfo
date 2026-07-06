import { CSSProperties, FC, PropsWithChildren, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import CopyButton from '@/components/common/copy-button';

interface OwnProps {
  ref?: any;
  title?: string;
  opened: boolean;
  onClose: () => void;
  className?: string;
  isRelative?: boolean;
  // When true, dim + blur the page behind the modal (full-screen overlay that also closes on
  // click). Opt-in — defaults to false so every existing BaseModal consumer is unchanged.
  withOverlay?: boolean;
  hideClose?: boolean;
  closeClassName?: string;
  contentClassName?: string;
  style?: CSSProperties;
  maxHeight?: string;
  copyText?: string;
}

const BaseModal: FC<PropsWithChildren<OwnProps>> = ({
  ref,
  opened,
  children,
  onClose,
  className = '',
  isRelative = false,
  withOverlay = false,
  title = '',
  style,
  hideClose = false,
  closeClassName = 'h-9 w-9',
  contentClassName = '',
  maxHeight = 'max-h-[80vh]',
  copyText = '',
}) => {
  const internalRef = useRef(null);
  const modalRef = ref || internalRef;
  useOnClickOutside(modalRef, () => onClose());
  return (
    <div ref={modalRef} className={`${opened ? 'block' : 'hidden'} ${isRelative ? 'relative' : ''}`}>
      {withOverlay && (
        <div className="fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      )}
      <div
        className={`${className} ${isRelative ? 'absolute' : 'fixed'} ${withOverlay ? 'z-overlay' : 'z-40'} bg-background shadow-3xl`}
        style={style}
      >
        <div className={`${!hideClose && 'pt-6'} relative p-3`}>
          {!hideClose && (
            <div
              className={`absolute right-0 top-0 z-50 bg-close bg-contain hover:bg-close_h active:bg-close_a ${closeClassName}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
            />
          )}
          {title && <div className="ml-9 text-lg text-highlight">{title}</div>}
          <div className={`${maxHeight} overflow-y-auto overflow-x-hidden ${contentClassName}`}>{children}</div>
          {copyText && (
            <div className="justify-self-end">
              <CopyButton value={copyText} size={'md'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;

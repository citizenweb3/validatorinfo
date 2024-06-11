import { FC, PropsWithChildren } from 'react';

interface OwnProps {
  opened: boolean;
  onClose: () => void;
}

const BaseModal: FC<PropsWithChildren<OwnProps>> = ({ opened, children, onClose }) => {
  return (
    <div className={`${opened ? 'block' : 'hidden'} relative`}>
      <div
        className="absolute -top-2 right-0 z-50 h-9 w-9 bg-[url('/img/icons/close.svg')] hover:bg-[url('/img/icons/close-h.svg')]"
        onClick={onClose}
      ></div>
      <div className="absolute right-0 top-0 z-40 bg-background p-3 pt-6 shadow-3xl">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default BaseModal;

import { FC } from 'react';

interface OwnProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Switch: FC<OwnProps> = ({ value, onChange }) => {
  return (
    <div onClick={() => onChange(!value)} className="relative mx-1 h-2.5 w-5 cursor-pointer rounded-full bg-highlight">
      <div
        className={`${value ? 'right-[0.0625rem]' : 'left-[0.0625rem]'} absolute top-[0.0625rem] h-2 w-2 rounded-full bg-background`}
      />
    </div>
  );
};

export default Switch;

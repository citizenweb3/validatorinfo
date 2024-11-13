import { FC } from 'react';

interface OwnProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Switch: FC<OwnProps> = ({ value, onChange }) => {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`${value ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} relative mx-1 h-7 w-16 cursor-pointer rounded-md from-highlight to-background`}
    >
      <div
        className={`${value ? 'right-[0.1rem]' : 'left-[0.1rem]'} absolute top-[0.1rem] h-[1.5rem] w-[1.5rem] rounded-md bg-background`}
      />
    </div>
  );
};

export default Switch;

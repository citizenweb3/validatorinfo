import { FC } from 'react';

interface OwnProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Switch: FC<OwnProps> = ({ value, onChange }) => {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`${value ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} relative mx-1 h-6 w-12 cursor-pointer rounded-md from-highlight to-[#3f3f3f]`}
    >
      <div
        className={`${value ? 'right-[0.1rem]' : 'left-[0.1rem]'} absolute bottom-[0.1rem] top-[0.1rem] w-[1.2rem] rounded-md border border-[#3f3f3f] bg-background`}
      />
    </div>
  );
};

export default Switch;

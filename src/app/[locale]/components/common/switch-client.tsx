'use client';

import { FC, useState } from 'react';

import Switch from '@/components/common/switch';

interface ClientSwitchProps {
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

const SwitchClient: FC<ClientSwitchProps> = ({ value = true, onToggle }) => {
  const [isValue, setIsValue] = useState(value);

  const handleClick = () => {
    const newValue = !isValue;
    setIsValue(newValue);
    if (onToggle) {
      onToggle(newValue);
    }
  };

  return <Switch value={isValue} onChange={handleClick} />;
};

export default SwitchClient;

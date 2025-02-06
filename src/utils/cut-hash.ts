const cutHash = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  const start = value.slice(0, 6);
  const end = value.slice(-6);
  return `${start}...${end}`;
};

export default cutHash;

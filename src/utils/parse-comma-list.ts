export const parseCommaList = (value?: string): string[] => {
  return value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
};

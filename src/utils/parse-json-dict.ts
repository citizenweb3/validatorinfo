export const parseJsonDict = (value?: string): Record<string, string> => {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return {};
  }
};

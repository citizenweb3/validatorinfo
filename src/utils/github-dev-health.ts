export const GITHUB_AUTHOR_WINDOW_DAYS = 90;

const startOfUtcDay = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const addUtcDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const toUtcDateString = (date: Date): string => date.toISOString().slice(0, 10);

export const getGithubAuthorWindow = (now: Date = new Date()): { cutoff: Date; completedThrough: Date } => {
  const completedThrough = addUtcDays(startOfUtcDay(now), -1);
  const cutoff = addUtcDays(completedThrough, -(GITHUB_AUTHOR_WINDOW_DAYS - 1));
  return { cutoff, completedThrough };
};

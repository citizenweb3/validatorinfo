export interface SlashingEventsExampleInterface {
  retroName: { height: number; time: string };
  commits: { token: number; usd: number };
}

export const getSlashingEventsExample = (): Promise<SlashingEventsExampleInterface[]> => {
  const slashingEventsExample: SlashingEventsExampleInterface[] = [
    {
      retroName: {
        height: 17828794,
        time: '2025-01-07',
      },
      commits: {
        token: 0,
        usd: 0,
      },
    },
    {
      retroName: {
        height: 17828795,
        time: '2025-01-07',
      },
      commits: {
        token: 0,
        usd: 0,
      },
    },
  ];

  return Promise.resolve(slashingEventsExample);
};

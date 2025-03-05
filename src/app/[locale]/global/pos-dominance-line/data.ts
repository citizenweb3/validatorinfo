type DataPoint = {
  date: Date;
  value: number;
};

export const generateDataForDays = (startDate: Date, endDate: Date, chartType: string): DataPoint[] => {
  const dataset: DataPoint[] = [];
  const oneDay = 24 * 60 * 60 * 1000;
  let currentDate = new Date(startDate);
  let previousValue = 50; // Starting with a mid-range value

  while (currentDate <= endDate) {
    // Generate a new value that is close to the previous value
    const fluctuation = (Math.random() - 0.5) * 20; // Fluctuation between -10 and 10
    const value = Math.max(0, Math.min(100, previousValue + fluctuation));

    dataset.push({ date: new Date(currentDate), value });

    // Update the previous value
    previousValue = value;

    // Increment the date based on the chart type
    if (chartType === 'Daily') {
      currentDate = new Date(currentDate.getTime() + oneDay);
    } else if (chartType === 'Weekly') {
      currentDate = new Date(currentDate.getTime() + oneDay * 7);
    } else if (chartType === 'Monthly') {
      currentDate = new Date(currentDate.getTime() + oneDay * 30);
    } else if (chartType === 'Yearly') {
      currentDate = new Date(currentDate.getTime() + oneDay * 365);
    }
  }

  console.log('Generated Data:', dataset);

  return dataset;
};

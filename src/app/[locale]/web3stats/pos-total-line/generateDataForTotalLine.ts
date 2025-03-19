type DataPoint = {
    date: Date;
    value: number;
    formattedValue: string; // Store the formatted value
  };
  
  export const generateDataForTotalLine = (startDate: Date, endDate: Date, chartType: string): { tvs: DataPoint[]; rewards: DataPoint[] } => {
    // Generate random value between 0 and 5 trillion
    const getRandomValue = () => Math.floor(Math.random() * 5 * 10**10); // Values between 0 and 5 trillion
  
    const generateDataset = (startDate: Date, endDate: Date, interval: number) => {
      const dataset = [];
      let currentDate = new Date(startDate);
  
      while (currentDate <= endDate) {
        const tvsValue = getRandomValue();
        const rewardsValue = getRandomValue();
        const formattedTvsValue = formatNumber(tvsValue);
        const formattedRewardsValue = formatNumber(rewardsValue);
        dataset.push({ date: new Date(currentDate), tvs: tvsValue, rewards: rewardsValue, formattedTvsValue, formattedRewardsValue });
        currentDate.setDate(currentDate.getDate() + interval);
      }
  
      return dataset;
    };
  
    let interval = 1; // Default to daily interval
    if (chartType === 'Weekly') {
      interval = 7;
    } else if (chartType === 'Monthly') {
      interval = 30;
    } else if (chartType === 'Yearly') {
      interval = 365;
    }
  
    const generatedData = generateDataset(startDate, endDate, interval);
  
    return {
      tvs: generatedData.map(d => ({ date: d.date, value: d.tvs, formattedValue: d.formattedTvsValue })),
      rewards: generatedData.map(d => ({ date: d.date, value: d.rewards, formattedValue: d.formattedRewardsValue })),
    };
  };
  
  // Function to format number with appropriate suffix (K, M, B, T)
  export function formatNumber(num: any): string {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(1) + 'T'; // Trillions (T)
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B'; // Billions (B)
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M'; // Millions (M)
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K'; // Thousands (K)
    } else {
      return num.toString(); // Less than 1000
    }
  }
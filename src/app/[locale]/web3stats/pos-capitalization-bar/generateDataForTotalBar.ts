import { DataPoint } from '../chartUtils'; // Adjust path as needed

export const generateDataForBarChart = (
  startDate: Date,
  endDate: Date,
  chartType: string
): { cryptpCapitlization: DataPoint[]; valueSecured: DataPoint[] } => {
  const baseValue = 5 * 10**10;  // Base value to center the fluctuations around

  // Function to generate a random value with both up and down fluctuations
  const getFluctuatingValue = (prevValue: number, maxFluctuation: number) => {
    // Generate a random fluctuation between -maxFluctuation and +maxFluctuation
    const fluctuation = (Math.random() - 0.5) * 2 * maxFluctuation; // Random number between -maxFluctuation and +maxFluctuation
    return Math.max(0, prevValue + fluctuation); // Ensure value is not negative
  };

  const generateDataset = (startDate: Date, endDate: Date, interval: number) => {
    const dataset = [];
    let currentDate = new Date(startDate);
    let prevCryptoCapValue = baseValue;
    let prevTopValueSecured = baseValue;

    while (currentDate <= endDate) {
      // Generate stable values with fluctuations in both directions
      const cryptoCapValue = getFluctuatingValue(prevCryptoCapValue, 1e10); // Max fluctuation of 1 billion
      const topValueSecured = getFluctuatingValue(prevTopValueSecured, 1e10); // Max fluctuation of 1 billion

      // Ensure values are not fluctuating too wildly and remain positive
      prevCryptoCapValue = cryptoCapValue;
      prevTopValueSecured = topValueSecured;

      const formattedCryptoCapValue = formatNumber(cryptoCapValue);
      const formattedTopValueSecured = formatNumber(topValueSecured);
      
      dataset.push({
        date: new Date(currentDate),
        cryptoCap: cryptoCapValue,
        topValueSecured: topValueSecured,
        formattedCryptoCapValue,
        formattedTopValueSecured,
      });
      currentDate.setDate(currentDate.getDate() + interval);
    }

    return dataset;
  };

  // Determine the interval based on chartType
  let interval = 1;
  if (chartType === 'Weekly') interval = 7;
  else if (chartType === 'Monthly') interval = 30;
  else if (chartType === 'Yearly') interval = 365;

  const generatedData = generateDataset(startDate, endDate, interval);

  return {
    cryptpCapitlization: generatedData.map(d => ({
      date: d.date,
      value: d.cryptoCap,
      formattedValue: d.formattedCryptoCapValue,
    })),
    valueSecured: generatedData.map(d => ({
      date: d.date,
      value: d.topValueSecured,
      formattedValue: d.formattedTopValueSecured,
    })),
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

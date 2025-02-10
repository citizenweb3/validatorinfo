type DataPoint = {
  date: Date;
  value: number;
};

export const generateDataForDays = (startDate: Date, endDate: Date) => {
  const getRandomValue = () => Math.floor(Math.random() * 60) + 20; // Values between 20 and 80

  // Helper function to generate dataset with random values for each day between start and end dates
  const generateDataset = (startDate: Date, endDate: Date) => {
    const dataset = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const tvsValue = getRandomValue();     // Random value for tvs
      const rewardsValue = getRandomValue(); // Random value for rewards
      dataset.push({ date: new Date(currentDate), tvs: tvsValue, rewards: rewardsValue }); // Save each day's date, tvs, and rewards values
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return dataset;
  };

  // Generate data for both tvs and rewards within the given date range
  const generatedData = generateDataset(startDate, endDate);

  // Return both tvs and rewards datasets
  return {
    tvs: generatedData.map(d => ({ date: d.date, value: d.tvs })),  // Map tvs values to DataPoint[]
    rewards: generatedData.map(d => ({ date: d.date, value: d.rewards })), // Map rewards values to DataPoint[]
  };
};

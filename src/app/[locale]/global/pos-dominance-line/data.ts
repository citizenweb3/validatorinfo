export const generateDataForDays = (startDate: Date, endDate: Date) => {
  const getRandomValue = () => Math.floor(Math.random() * 60) + 20; // Values between 20 and 80

  // Helper function to generate dataset with random values for each day between start and end dates
  const generateDataset = (startDate: Date, endDate: Date) => {
    const dataset = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const value = getRandomValue();
      dataset.push({ date: new Date(currentDate), value }); // Save each day's date and the random value
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return dataset;
  };

  // Generate data for the given date range
  return generateDataset(startDate, endDate);
};

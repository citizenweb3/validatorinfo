// data.ts

export const generateDataForYears = (startYear: number) => {
  const getRandomValue = () => Math.floor(Math.random() * 60) + 20; // Values between 20 and 80

  // Function to generate a random date in a given range of years
  const getRandomDate = (startYear: number, endDate: Date) => {
    const startDate = new Date(`${startYear}-01-01`);
    return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  };

  // Helper function to generate dataset with random values across the given range
  const generateDataset = (startYear: number, endDate: Date) => {
    const dataset = [];
    const monthsInYear = 12;
    const totalMonths = (endDate.getFullYear() - startYear + 1) * monthsInYear;

    for (let i = 0; i < totalMonths; i++) {
      const month = i % monthsInYear;
      const year = startYear + Math.floor(i / monthsInYear);
      const date = new Date(year, month, 1); // 1st day of the month
      const value = getRandomValue();
      dataset.push({ date, value });
    }

    return dataset;
  };

  // Use current system date as the end date
  const currentDate = new Date();
  
  // Generate datasets based on dynamic range
  const dataset1 = generateDataset(startYear, currentDate);
  const dataset2 = generateDataset(startYear, currentDate);
  const dataset3 = generateDataset(startYear, currentDate);
  const dataset4 = generateDataset(startYear, currentDate);
  const dataset5 = generateDataset(startYear, currentDate);

  return { dataset1, dataset2, dataset3, dataset4, dataset5 };
};
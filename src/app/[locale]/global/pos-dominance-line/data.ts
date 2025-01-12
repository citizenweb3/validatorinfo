// src/utils/generateData.ts
export const generateData = (timeFrame: string, selectedEcosystems: string[]) => {
  const getRandomValue = () => {
    return Math.floor(Math.random() * 60) + 20; // Values between 20 and 80
  };

  const generateHourlyData = (date: Date) => {
    const data = [];
    const baseValue = getRandomValue();
    
    for (let hour = 0; hour < 24; hour++) {
      const currentDate = new Date(date);
      currentDate.setHours(hour, 0, 0, 0);
      const variation = (Math.random() - 0.5) * 5;
      data.push({
        x: currentDate.toISOString(),
        y: Math.max(0, Math.min(100, baseValue + variation))
      });
    }
    return data;
  };

  const generateForDateRange = (startDate: Date, endDate: Date, ecosystem: string) => {
    const data = [];
    const currentDate = new Date(startDate);
    let previousValue = getRandomValue();

    while (currentDate <= endDate) {
      if (timeFrame === 'Daily') {
        // For daily view, generate 24 hours of data
        data.push(...generateHourlyData(currentDate));
      } else {
        // For weekly and monthly views, one data point per day
        const change = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, previousValue + change));
        previousValue = newValue;
        
        data.push({
          x: currentDate.toISOString(),
          y: newValue
        });
      }

      // Increment date based on timeframe
      switch (timeFrame) {
        case 'Daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'Weekly':
          currentDate.setDate(currentDate.getDate() + 1); // One data point per day for 24 days
          break;
        case 'Monthly':
          currentDate.setMonth(currentDate.getMonth() + 1); // One data point per month for 24 months
          break;
      }
    }

    return { name: ecosystem, category: ecosystem, values: data };
  };

  // Filter selected ecosystems
  const selectedData = selectedEcosystems.filter(ecosystem => ecosystem !== 'all');

  // Calculate date range based on timeframe
  const endDate = new Date();
  const startDate = new Date();

  switch (timeFrame) {
    case 'Daily':
      // Only today with 24 hour data points
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'Weekly':
      // 24 days of data
      startDate.setDate(endDate.getDate() - 23);
      break;
    case 'Monthly':
      // 24 months of data
      startDate.setMonth(endDate.getMonth() - 23);
      break;
  }

  return selectedData.map((ecosystem) =>
    generateForDateRange(startDate, endDate, ecosystem)
  );
};
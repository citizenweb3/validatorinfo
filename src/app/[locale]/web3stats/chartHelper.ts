export const formatXAxisTick = (date: Date, chartType: string): string => {
  const now = new Date();
  let formattedLabel = '';

  switch (chartType) {
    case 'Weekly':
      // Calculate the week number in the year
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const diffTime = date.getTime() - startOfYear.getTime();
      const weekNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
      // Format as Week number and year
      formattedLabel = `Week ${weekNumber}, ${date.getFullYear()}`;
      break;

    case 'Monthly':
      // Get the month name and year (e.g., Jan 2025)
      const monthName = date.toLocaleString('default', { month: 'short' }); // 'Jan', 'Feb', etc.
      formattedLabel = `${monthName} ${date.getFullYear()}`;
      break;

    case 'Yearly':
      // Just show the year
      formattedLabel = `${date.getFullYear()}`;
      break;

    case 'Daily':
      // Get the month name, day of the month, and year (e.g., May 24, 2025)
      const day = date.getDate();
      const fullMonthName = date.toLocaleString('default', { month: 'long' }); // Full month name (e.g., 'May')
      formattedLabel = `${fullMonthName} ${day}, ${date.getFullYear()}`;
      break;

    default:
      formattedLabel = date.toLocaleDateString(); // Fallback to date if no specific chartType
  }

  return formattedLabel;
};

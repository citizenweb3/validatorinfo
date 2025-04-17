const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  import { timeFormat } from 'd3-time-format';
  
  const isoWeekFormat = timeFormat('%V'); // ISO week number (01-53)
  const yearFormat = timeFormat('%G');    // ISO week-numbering year
  
  export const formatXAxisTick = (date: Date, chartType: string): string => {
    switch (chartType) {
      case 'Weekly':
        return `Week ${isoWeekFormat(date)}`;
  
      case 'Monthly':
        return `${monthShortNames[date.getMonth()]} ${date.getFullYear()}`;
  
      case 'Yearly':
        return `${date.getFullYear()}`;
  
      case 'Daily':
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  
      default:
        return date.toLocaleDateString();
    }
  };
  
  
  
  export function formatNumber(num: any, precision: number = 1): string {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(precision) + 'T'; // Trillions (T)
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(precision) + 'B'; // Billions (B)
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(precision) + 'M'; // Millions (M)
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(precision) + 'K'; // Thousands (K)
    } else {
      return num.toString(); // Less than 1000
    }
  }
  
  
  
  
  export function drawDropShadow(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    // Define the drop shadow filter
    const defs = svg.append('defs');
    defs
      .append('filter')
      .attr('id', 'shadow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 1)
      .attr('stdDeviation', 1)
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.5);
  }
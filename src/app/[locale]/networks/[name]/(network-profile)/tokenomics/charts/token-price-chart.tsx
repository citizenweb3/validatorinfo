'use client';

import * as d3 from 'd3';
import { FC, useEffect, useRef, useState, useMemo } from 'react';
import ChartButtons from '@/app/comparevalidators/chart-buttons';
import {
  ChartConfig,
  setupYScale,
  setupXScale,
  drawYAxis,
  drawLine,
  TooltipConfig,
  DataPoint,
  handleTooltip
} from '@/app/components/chart/chartUtils';
import { formatNumber } from '@/app/components/chart/chartHelper';

interface PriceData {
  id: number;
  chainId: number;
  value: number;
  createdAt: Date;
}

interface TokenPriceChartProps {
  priceHistory: PriceData[];
  chainName: string;
}

// Helper functions for data aggregation

/**
 * Get Monday of the week for a given date
 */
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

/**
 * Get start of day
 */
const getStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get start of month
 */
const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get start of year
 */
const getStartOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

/**
 * Aggregate data by day - one value per day (last value of the day)
 */
const aggregateByDay = (data: DataPoint[]): DataPoint[] => {
  const grouped = new Map<string, DataPoint[]>();

  data.forEach((point) => {
    const dayKey = getStartOfDay(point.date).toISOString();
    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, []);
    }
    grouped.get(dayKey)!.push(point);
  });

  return Array.from(grouped.entries()).map(([dayKey, points]) => {
    // Return last value of the day
    const lastPoint = points[points.length - 1];
    return {
      date: getStartOfDay(lastPoint.date),
      value: lastPoint.value,
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Aggregate data by week - one value per week (last value of the week)
 * Week starts on Monday
 */
const aggregateByWeek = (data: DataPoint[]): DataPoint[] => {
  const grouped = new Map<string, DataPoint[]>();

  data.forEach((point) => {
    const monday = getMonday(point.date);
    const weekKey = monday.toISOString();
    if (!grouped.has(weekKey)) {
      grouped.set(weekKey, []);
    }
    grouped.get(weekKey)!.push(point);
  });

  return Array.from(grouped.entries()).map(([weekKey, points]) => {
    // Return last value of the week
    const lastPoint = points[points.length - 1];
    const monday = getMonday(lastPoint.date);
    return {
      date: monday,
      value: lastPoint.value,
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Aggregate data by month - one value per month (last value of the month)
 */
const aggregateByMonth = (data: DataPoint[]): DataPoint[] => {
  const grouped = new Map<string, DataPoint[]>();

  data.forEach((point) => {
    const monthKey = getStartOfMonth(point.date).toISOString();
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(point);
  });

  return Array.from(grouped.entries()).map(([monthKey, points]) => {
    // Return last value of the month
    const lastPoint = points[points.length - 1];
    return {
      date: getStartOfMonth(lastPoint.date),
      value: lastPoint.value,
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Aggregate data by year - one value per year (last value of the year)
 */
const aggregateByYear = (data: DataPoint[]): DataPoint[] => {
  const grouped = new Map<string, DataPoint[]>();

  data.forEach((point) => {
    const yearKey = getStartOfYear(point.date).toISOString();
    if (!grouped.has(yearKey)) {
      grouped.set(yearKey, []);
    }
    grouped.get(yearKey)!.push(point);
  });

  return Array.from(grouped.entries()).map(([yearKey, points]) => {
    // Return last value of the year
    const lastPoint = points[points.length - 1];
    return {
      date: getStartOfYear(lastPoint.date),
      value: lastPoint.value,
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
};

const TokenPriceChart: FC<TokenPriceChartProps> = ({ priceHistory, chainName }) => {
  // Define ecosystems and their colors (can be extended as needed)
  const Labels = ['Price'];
  const colorMap = {
    'Price': '#4FB848',
  };

  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [datasets, setDatasets] = useState<{ [Labels: string]: DataPoint[] }>({});
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const plotAreaRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic width based on number of data points and chart type
  const calculateChartWidth = (dataPoints: number, type: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'): number => {
    const minWidth = 1000; // Minimum width to fill container

    // Different spacing for different chart types
    let pointSpacing: number;
    let minWidthForType: number;

    switch (type) {
      case 'Daily':
        pointSpacing = 80; // Wider spacing to prevent date labels from overlapping
        minWidthForType = minWidth;
        break;
      case 'Weekly':
        pointSpacing = 10; // Compact spacing to show multiple weeks in viewport
        minWidthForType = minWidth;
        break;
      case 'Monthly':
        pointSpacing = 100; // Significantly increased spacing to prevent text overlap
        minWidthForType = minWidth; // Ensure monthly charts are always wide enough
        break;
      case 'Yearly':
        pointSpacing = 350; // Much wider spacing for yearly data to stretch the graph
        minWidthForType = minWidth; // Ensure yearly charts stretch across container
        break;
      default:
        pointSpacing = 15;
        minWidthForType = minWidth;
    }

    const calculatedWidth = dataPoints * pointSpacing;
    return Math.max(minWidthForType, calculatedWidth);
  };

  const [width, setWidth] = useState(5000);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 330,
      margin: { top: 10, right: 0, bottom: 30, left: 0 },
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
      gapLeft: 0,
      gapRight: 60,
      leftOffset: 0,
      rightOffset: 0,
      xScalePadding: 0,
      legendOffset: 5,
    }),
    [width]
  );

  const tooltipConfig: TooltipConfig = {
    width: 180,
    rowHeight: 20,
    baseHeight: 25,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 165,
  };

  const drawChart = () => {
    if (!chartRef.current || !plotAreaRef.current || !Object.values(datasets).some(data => data.length > 0)) return;

    // Clear previous charts
    d3.select(chartRef.current).select('svg').remove();
    d3.select(plotAreaRef.current).select('svg').remove();

    const { padding } = chartConfig;
    const chartHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
    const plotHeight = chartHeight - chartConfig.padding.top - chartConfig.padding.bottom;
    const plotWidth = width - 200; // Full width for scrollable area

    // Y-axis container width (must match the div width below)
    const yAxisContainerWidth = 60;

    // Y-axis positioning (fixed within its container) - align to right edge
    const yAxisXPosition = yAxisContainerWidth;

    // Plot area should start at 0 to align with Y-axis
    const plotLeftOffset = 0;

    // Create fixed Y-axis SVG
    const yAxisSvg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', yAxisContainerWidth)
      .attr('height', chartConfig.height)
      .style('position', 'absolute')
      .style('left', '0')
      .style('top', '0')
      .style('z-index', '10');

    // Create scrollable plot area SVG
    const plotSvg = d3.select(plotAreaRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', chartConfig.height);

    // drawLine adds xAxisOffset of -20px for Daily charts (which translates to +20px shift)
    // We compensate by shifting plotGroup left by 20px to align with Y-axis
    const dailyChartOffset = chartType === 'Daily' ? -20 : 0;
    const plotGroup = plotSvg.append('g')
      .attr('transform', `translate(${plotLeftOffset + dailyChartOffset}, ${chartConfig.margin.top})`);

    // Setup scales
    const xScale = setupXScale(xDomain, plotWidth);

    const allValues: number[] = Labels.flatMap(label =>
      datasets[label]?.map(d => d.value).filter(v => v !== null && v !== undefined) || []
    );

    if (allValues.length === 0) {
      return;
    }

    const yMax = d3.max(allValues) ?? 100;
    const yMinValue = 0;
    const yScale = setupYScale([yMinValue, yMax * 1.05], plotHeight, 'linear');

    // Draw Y-axis (fixed) with same vertical offset as plot group
    // Note: drawYAxis subtracts 20 from yOffset internally, so we add 20 to compensate
    drawYAxis(yAxisSvg, yScale, yAxisXPosition, chartConfig.margin.top + 20, {
      tickFormat: (d) => `$${formatNumber(Number(d))}`,
      usePercentage: false,
      fontFamily: 'Handjet',
      fontSize: '13.75px',
      labelOffset: -30
    });

    // Draw X-axis (scrollable) - Custom implementation based on chart type
    let xAxis: d3.Axis<Date | d3.NumberValue>;

    switch (chartType) {
      case 'Daily':
        // For daily view: show date as "Nov 3" for every day
        xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeDay.every(1)) // Show tick for every day
          .tickFormat((domainValue: Date | d3.NumberValue) => {
            const date = domainValue instanceof Date ? domainValue : new Date(domainValue as number);
            const month = date.toLocaleString('default', { month: 'short' });
            return `${month} ${date.getDate()}`;
          });
        break;

      case 'Weekly':
        // For weekly view: show date range as "3.11 - 9.11"
        xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeWeek.every(1))
          .tickFormat((domainValue: Date | d3.NumberValue) => {
            const date = domainValue instanceof Date ? domainValue : new Date(domainValue as number);
            const monday = getMonday(date);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const startDay = monday.getDate();
            const startMonth = monday.getMonth() + 1;
            const endDay = sunday.getDate();
            const endMonth = sunday.getMonth() + 1;

            // Format: "3.11 - 9.11" or "28.10 - 3.11" if spans months
            return `${startDay}.${startMonth.toString().padStart(2, '0')} - ${endDay}.${endMonth.toString().padStart(2, '0')}`;
          });
        break;

      case 'Monthly':
        // For monthly view: show month name as "Nov 2024"
        xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeMonth.every(1))
          .tickFormat((domainValue: Date | d3.NumberValue) => {
            const date = domainValue instanceof Date ? domainValue : new Date(domainValue as number);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            return `${month} ${year}`;
          });
        break;

      case 'Yearly':
        // For yearly view: show year as "2024"
        xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeYear.every(1))
          .tickFormat((domainValue: Date | d3.NumberValue) => {
            const date = domainValue instanceof Date ? domainValue : new Date(domainValue as number);
            return `${date.getFullYear()}`;
          });
        break;

      default:
        // Fallback to default formatting
        xAxis = d3.axisBottom(xScale)
          .ticks(10)
          .tickFormat((domainValue: Date | d3.NumberValue) => {
            const date = domainValue instanceof Date ? domainValue : new Date(domainValue as number);
            const month = date.toLocaleString('default', { month: 'short' });
            return `${month} ${date.getDate()}`;
          });
    }

    plotGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${plotHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#FFFFFF')
      .style('font-family', 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif')
      .style('font-size', '13.75px')
      .style('font-weight', '400')
      .style('text-anchor', 'middle')
      .attr('dy', '1em');

    plotGroup.selectAll('.x-axis line')
      .style('stroke', '#444444');

    plotGroup.selectAll('.x-axis path')
      .style('stroke', '#444444');

    const lineGenerator = d3.line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw lines (scrollable)
    Labels.forEach((label) => {
      if (datasets[label]) {
        const pathData = lineGenerator(datasets[label]);
        if (pathData) {
          drawLine(plotGroup, datasets[label], chartType, colorMap[label as keyof typeof colorMap], lineGenerator);
        } else {
          console.warn(`Skipping drawing for ${label} because path is null`);
        }
      }
    });

    // Add tooltip functionality (scrollable)
    handleTooltip(
      plotSvg,
      plotGroup,
      datasets,
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => `$${value.toFixed(2)}`,
      colorMap,
      padding.left,
      padding.top,
      plotWidth,
      plotHeight,
      chartType,
      false
    );
  };

  // Filter and process data from props based on chartType
  useEffect(() => {
    if (!priceHistory || priceHistory.length === 0) {
      setDatasets({ 'Price': [] });
      return;
    }

    // Convert all data to Date objects for processing
    const allDataWithDates = priceHistory.map((price) => ({
      date: new Date(price.createdAt),
      value: price.value,
    }));

    // Sort by date ascending
    allDataWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Find the actual min and max dates from database
    const minDate = allDataWithDates[0].date;
    const maxDate = allDataWithDates[allDataWithDates.length - 1].date;

    let startDate: Date;
    let endDate: Date = maxDate;

    // Calculate start date based on chartType and available data
    // All chart types show data for the full available period (up to 3 years)
    switch (chartType) {
      case 'Daily': {
        // Show all available data (up to 3 years) aggregated by day
        startDate = minDate;
        break;
      }
      case 'Weekly': {
        // Show all available data (up to 3 years) aggregated by week
        startDate = minDate;
        break;
      }
      case 'Monthly': {
        // Show all available data (up to 3 years) aggregated by month
        startDate = minDate;
        break;
      }
      case 'Yearly': {
        // Show all available data (up to 3 years) aggregated by year
        startDate = minDate;
        break;
      }
      default:
        // Show all available data
        startDate = minDate;
    }

    // Filter data based on calculated date range
    const filteredData = allDataWithDates.filter((price) => {
      return price.date >= startDate && price.date <= endDate;
    });

    // Aggregate data based on chart type
    let aggregatedData: DataPoint[];
    switch (chartType) {
      case 'Daily':
        // One value per day (last value of the day)
        aggregatedData = aggregateByDay(filteredData);
        break;
      case 'Weekly':
        // One value per week (last value of the week)
        aggregatedData = aggregateByWeek(filteredData);
        break;
      case 'Monthly':
        // One value per month (last value of the month)
        aggregatedData = aggregateByMonth(filteredData);
        break;
      case 'Yearly':
        // One value per year (last value of the year)
        aggregatedData = aggregateByYear(filteredData);
        break;
      default:
        aggregatedData = filteredData;
    }

    // Calculate dynamic width based on aggregated data points and chart type
    const calculatedWidth = calculateChartWidth(aggregatedData.length, chartType);
    setWidth(calculatedWidth);

    setDatasets({ 'Price': aggregatedData });
    setXDomain([startDate, endDate]);
  }, [chartType, priceHistory]);

  useEffect(() => {
    if (Object.values(datasets).some(data => data.length > 0) && width > 0 && isChart) {
      drawChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, width, isChart, chartType]);

  const handleChartChanged = (value: boolean) => {
    setIsChart(value);
    if (!value) {
      setChartType(undefined as any);
    } else {
      setChartType('Daily');
    }
  };

  return (
    <>
      <style jsx>{`
        .chart-scrollbar-container {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #2a2a2a;
        }
        .chart-scrollbar-container::-webkit-scrollbar {
          height: 12px;
          -webkit-appearance: none;
        }
        .chart-scrollbar-container::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 8px;
        }
        .chart-scrollbar-container::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 8px;
          border: 2px solid #2a2a2a;
          min-width: 50px;
        }
        .chart-scrollbar-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
      <div>
        <div className="flex items-start justify-start mt-2 ml-20">
          <ChartButtons
            onlyDays
            ecosystems={false}
            isChart={isChart}
            onChartChanged={handleChartChanged}
            chartType={chartType}
            onTypeChanged={(name) => setChartType(name as any)}
          />
        </div>

        {isChart ? (
          <div className="" style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            boxSizing: 'border-box',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '345px',
            }}>
              {/* Fixed Y-axis container */}
              <div
                ref={chartRef}
                className="bg-background"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '60px',
                  height: '330px',
                  zIndex: 10,
                }}
              />

              {/* Plot area background (only chart, not axes) */}
              <div
                className="bg-table_row"
                style={{
                  position: 'absolute',
                  left: '60px',
                  top: '10px',
                  right: '0',
                  height: '290px',
                }}
              />

              {/* Scrollable plot area container */}
              <div
                ref={containerRef}
                className="chart-scrollbar-container"
                style={{
                  position: 'absolute',
                  left: '60px',
                  top: '0',
                  right: '0',
                  height: '345px',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  paddingBottom: '0px',
                }}
              >
                <div
                  ref={plotAreaRef}
                  style={{
                    width: `${width}px`,
                    height: '330px',
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 px-14 text-center text-white text-lg">
            Chart is disabled. Toggle to view chart.
          </div>
        )}
      </div>
    </>
  );
};

export default TokenPriceChart;

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
import { generateSampleData} from '@/app/components/chart/sampleData';

const NetworkAprTvsChart: FC = () => {
  // Define ecosystems and their colors (can be extended as needed)
  const LegendLabels = ['APY (Compounded Interest)', 'APR (Simple Interest)', 'TVL'];
  const colorMapLegends = { 'APY (Compounded Interest)': '#E5C46B', 'APR (Simple Interest)': '#4FB848', 'TVL': '#2077E0', };
  const Labels = [ 'APY', 'APR', 'TVL' , ];
  const colorMap = { 'APY': '#E5C46B', 'APR': '#4FB848', 'TVL': '#2077E0', };
  const dataRanges = {
    'APY': { min: 20, max: 45 },
    'APR': { min: 10, max: 35 },
    'TVL': { min: 40, max: 70 },
  };
  const startingPrices = {
    'APY': 32.5, // Middle of 20-45 range
    'APR': 22.5, // Middle of 10-35 range
    'TVL': 55,   // Middle of 40-70 range
  };


  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [datasets, setDatasets] = useState<{ [Labels: string]: DataPoint[] }>({});
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width] = useState(5000);
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const plotAreaRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 330,
      margin: { top: 30, right: 0, bottom: 30, left: 0 },
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
    if (!chartRef.current || !plotAreaRef.current || !legendRef.current || !Object.values(datasets).some(data => data.length > 0)) return;

    // Clear previous charts
    d3.select(chartRef.current).select('svg').remove();
    d3.select(plotAreaRef.current).select('svg').remove();
    d3.select(legendRef.current).select('svg').remove();

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
      console.warn('No valid data available to draw the chart');
      return;
    }

    // Use Y-axis range of 0-100 for percentage data
    const yMax = 100;
    const yMinValue = 0;
    const yScale = setupYScale([yMinValue, yMax], plotHeight, 'linear');

    // Draw Y-axis (fixed) with same vertical offset as plot group
    // Note: drawYAxis subtracts 20 from yOffset internally, so we add 20 to compensate
    drawYAxis(yAxisSvg, yScale, yAxisXPosition, chartConfig.margin.top + 20, {
      tickFormat: (d) => `${Number(d).toFixed(0)}%`,
      usePercentage: false,
      fontFamily: 'Handjet',
      fontSize: '13.75px',
      labelOffset: -30
    });

    // Draw X-axis (scrollable) - Custom implementation for long date ranges
    const totalDays = Math.floor((xDomain[1].getTime() - xDomain[0].getTime()) / (1000 * 60 * 60 * 24));
    let tickInterval;
    let tickFormat;

    if (totalDays > 1000) {
      // For ranges over ~3 years, show ticks every 3 months
      tickInterval = d3.timeMonth.every(3);
      tickFormat = (d: Date | d3.NumberValue) => {
        const date = d as Date;
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        // Show year on January
        if (date.getMonth() === 0) {
          return `${month} ${day}, ${date.getFullYear()}`;
        }
        return `${month} ${day}`;
      };
    } else if (totalDays > 365) {
      // For ranges 1-3 years, show ticks every month
      tickInterval = d3.timeMonth.every(1);
      tickFormat = (d: Date | d3.NumberValue) => {
        const date = d as Date;
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        if (date.getMonth() === 0) {
          return `${month} ${day}, ${date.getFullYear()}`;
        }
        return `${month} ${day}`;
      };
    } else {
      // For shorter ranges, use weekly ticks
      tickInterval = d3.timeWeek.every(1);
      tickFormat = (d: Date | d3.NumberValue) => {
        const date = d as Date;
        const month = date.toLocaleString('default', { month: 'short' });
        return `${month} ${date.getDate()}`;
      };
    }

    const xAxis = d3.axisBottom(xScale)
      .ticks(tickInterval)
      .tickFormat(tickFormat);

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
      (value) => `$${formatNumber(value)}`,
      colorMap,
      padding.left,
      padding.top,
      plotWidth,
      plotHeight,
      chartType,
      true
    );

    // Draw legend in fixed container below the scrollbar - centered under chart
    const legendContainer = legendRef.current;
    const containerWidth = legendContainer?.offsetWidth || 1000;

    const legendSvg = d3.select(legendRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', 60);

    const legendItems = LegendLabels.map(label => ({
      label: label,
      color: colorMapLegends[label as keyof typeof colorMapLegends],
    }));

    // Calculate total width needed for all legend items
    const itemWidth = 280;
    const totalLegendWidth = legendItems.length * itemWidth;
    // Center under the chart area (offset by Y-axis width of 60px) with additional right shift
    const startX = 60 + (containerWidth - 60 - totalLegendWidth) / 2 + 40;

    // Draw legend with centered positioning
    const legendGroup = legendSvg.append('g')
      .attr('transform', 'translate(0, 20)');

    legendItems.forEach((item, i) => {
      const legendItem = legendGroup.append('g')
        .attr('transform', `translate(${startX + i * itemWidth}, 0)`);

      legendItem.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', item.color);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 9)
        .style('fill', '#FFFFFF')
        .style('font-family', 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif')
        .style('font-size', '14px')
        .text(item.label);
    });
  };

  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const data = Labels.reduce((acc, label) => {
        const range = dataRanges[label as keyof typeof dataRanges];
        const startingPrice = startingPrices[label as keyof typeof startingPrices];

        // Generate sample data
        const labelData = generateSampleData(startDate, endDate, chartType, [label], {
          startingPrice: startingPrice,
          volatility: 0.03,
          regenerate: true,
        });

        // Normalize data to fit within the specified range
        const points = labelData[label];
        if (points && points.length > 0) {
          // Find min and max in generated data
          const values = points.map(p => p.value);
          const minVal = Math.min(...values);
          const maxVal = Math.max(...values);

          // Normalize each point to fit the target range
          const normalizedPoints = points.map(point => ({
            ...point,
            value: range.min + ((point.value - minVal) / (maxVal - minVal)) * (range.max - range.min)
          }));

          return { ...acc, [label]: normalizedPoints };
        }

        return { ...acc, [label]: points };
      }, {});
      setDatasets(data);
    }, 1);
  };


  useEffect(() => {
    const now = new Date();
    const startDate = new Date('2010-01-03');

    const endDate = now;
    setXDomain([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  }, [chartType]);

  useEffect(() => {
    if (Object.values(datasets).some(data => data.length > 0) && width > 0 && isChart) {
      drawChart();
    }
  }, [datasets, width, isChart]);

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
      <div className="">
        <div className="flex items-center justify-center">
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
          <div className="mt-5 ml-20" style={{
            position: 'relative',
            width: '100%',
            maxWidth: 'calc(100vw - 700px)',
            overflow: 'hidden',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            boxSizing: 'border-box',
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '345px',
              backgroundColor: '#1E1E1E',
            }}>
              {/* Fixed Y-axis container */}
              <div
                ref={chartRef}
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '60px',
                  height: '330px',
                  zIndex: 10,
                  backgroundColor: '#1E1E1E',
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
                  overflowX: 'scroll',
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

            {/* Fixed legend container below scrollbar */}
            <div
              ref={legendRef}
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#1E1E1E',
              }}
            />
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

export default NetworkAprTvsChart;
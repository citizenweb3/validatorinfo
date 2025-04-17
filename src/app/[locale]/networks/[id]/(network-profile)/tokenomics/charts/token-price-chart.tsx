'use client';

import * as d3 from 'd3';
import { FC, useEffect, useRef, useState, useMemo } from 'react';
import ChartButtons from '@/app/comparevalidators/chart-buttons';
import {
  ChartConfig,
  setupChartArea,
  setupYScale,
  setupXScale,
  drawYAxis,
  drawXAxis,
  drawLine,
  handleTooltip,
  TooltipConfig,
  handleWheel,
  DataPoint
} from '../../chartUtils';
import { formatNumber } from '../../chartHelper';
import { generateDataForTokenPrice } from './tokenPriceSampleData';

const TokenPriceChart: FC = () => {
  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width, setWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  // Chart configuration with dynamic width
  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 300,
      margin: { top: 30, right: 0, bottom: 50, left: 0 },
      padding: { left: 60, right: 0, top: 50, bottom: 50 },
      gapLeft: 60,
      gapRight: 120,
      leftOffset: 0,
      rightOffset: 0,
      xScalePadding: 60,
      legendOffset: 10,
    }),
    [width]
  );

  // Tooltip configuration
  const tooltipConfig: TooltipConfig = {
    width: 180,
    rowHeight: 22,
    baseHeight: 30,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 165,
  };

  // Function to draw the chart
  const drawChart = () => {
    if (!chartRef.current || !dataset.length) return;

    // Clear any previous SVG
    d3.select(chartRef.current).select('svg').remove();

    const { svg, plotArea } = setupChartArea(chartRef, chartConfig);

    const { padding, gapLeft, gapRight } = chartConfig;
    const chartWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
    const chartHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
    const plotWidth = chartWidth - chartConfig.padding.left - chartConfig.padding.right - 100;
    const plotHeight = chartHeight - chartConfig.padding.top - chartConfig.padding.bottom;
    const plotLeft = padding.left + gapLeft;
    const plotRight = chartWidth - gapRight;

    // Setup scales
    const xScale = setupXScale(xDomain, plotWidth);
    const yMax = d3.max(dataset, (d) => d.value) ?? 100;
    const yMin = d3.min(dataset, (d) => d.value) ?? 0;
    const yScale = setupYScale([yMin * 0.95, yMax * 1.05], chartHeight, 'linear');

    // Draw axes
    drawYAxis(svg, yScale, padding.left, padding.bottom, (d) => `$${Number(d).toFixed(2)}`);
    drawXAxis(plotArea, xScale, plotHeight, chartConfig, chartType);

    // Draw line
    const lineGenerator = d3.line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    drawLine(plotArea, dataset, chartType, '#4FB848', lineGenerator);

    // Tooltip
    // handleTooltip(
    //   svg,
    //   plotArea,
    //   { ETH: dataset }, // Wrap dataset in an object for compatibility
    //   xScale,
    //   yScale,
    //   chartConfig,
    //   tooltipConfig,
    //   (value) => `$${formatNumber(value)}`,
    //   { ETH: '#4FB848' }, // Single color for ETH
    //   plotLeft,
    //   plotRight,
    //   chartWidth,
    //   chartHeight,
    //   chartType
    // );

    // Handle scroll/zoom
    svg.on('wheel', (event) =>
      handleWheel(event, xDomain, setXDomain, fetchDataForRange, new Date('2010-01-01'), new Date())
    );
  };

  // Fetch data for the current range
  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const data = generateDataForTokenPrice(startDate, endDate, chartType, ['ETH'], {
        startingPrice: 1800,
        volatility: 0.07,
        regenerate: true,
      });
      setDataset(data['ETH']);
    }, 1);
  };

  // Handle window resize for dynamic width
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setWidth(chartRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load chart data when chartType changes
  useEffect(() => {
    const now = new Date();
    let startDate: Date;

    switch (chartType) {
      case 'Daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 65);
        break;
      case 'Weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 13 * 7);
        break;
      case 'Monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12);
        break;
      case 'Yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 10);
        break;
      default:
        startDate = new Date('2010-01-01');
    }

    const endDate = now;
    setXDomain([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  }, [chartType]);

  // Draw chart when dataset or width changes
  useEffect(() => {
    if (dataset.length && width > 0) {
      drawChart();
    }
  }, [dataset, xDomain, width]);

  return (
    <div className="mt-3 mb-16">
      <div className="flex items-center justify-center">
        <ChartButtons
          onlyDays
          ecosystems={false}
          isChart={isChart}
          onChartChanged={setIsChart}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name as any)}
        />
      </div>
      <div
        ref={chartRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          backgroundColor: '#1E1E1E',
          marginTop: '20px',
        }}
      />
    </div>
  );
};

export default TokenPriceChart;
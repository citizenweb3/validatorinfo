import * as d3 from 'd3';
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateDataForBarChart, formatNumber } from './generateDataForTotalBar';
import { FC } from 'react';
import {
  handleBarTooltip,
  drawLegend,
  setupChartArea,
  setupXScale,
  setupYScale,
  drawXAxis,
  drawYAxis,
  handleWheel,
  ChartConfig,
  TooltipConfig,
  DataPoint,
  drawBars,
} from '../chartUtils';

interface ChartWidgetProps {
  chartType: string;
}

const PosTotalChartWidget: FC<ChartWidgetProps> = ({ chartType }) => {
  const [datasets, setDatasets] = useState<{ cryptoCapitalization: DataPoint[]; valueSecured: DataPoint[] }>({ cryptoCapitalization: [], valueSecured: [] });
  const chartRef = useRef<HTMLDivElement>(null);
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width, setWidth] = useState(0);

  // Define chartConfig with dynamic width using useMemo to optimize performance
  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 300,
      margin: { top: 5, right: 70, bottom: 40, left: 70 }, // Increased right margin
      leftOffset: 30,
      rightOffset: 30,
      xScalePadding: 60,
      legendOffset: 20,
    }),
    [width]
  );

  const tooltipConfig: TooltipConfig = {
    width: 280,
    rowHeight: 22,
    baseHeight: 30,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 100,
  };

  // Fetch data for the specified date range
  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const newDatasets = generateDataForBarChart(startDate, endDate, chartType);
      setDatasets({ cryptoCapitalization: newDatasets.cryptpCapitlization, valueSecured: newDatasets.valueSecured });
    }, 1);
  };

  // Draw the chart with the current width
  const drawChart = () => {
    const { svg, chartArea } = setupChartArea(chartRef, chartConfig);

    const xScale = setupXScale(xDomain, chartConfig);
    const yScale = setupYScale([0, 2 * 10 ** 11], chartConfig);

    drawXAxis(svg, xScale, chartConfig, chartType);
    drawYAxis(svg, yScale, chartConfig, (d) => formatNumber(d));

    const totalBars = datasets.cryptoCapitalization.length + datasets.valueSecured.length;
    const availableWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.leftOffset - chartConfig.rightOffset;
    const barWidth = availableWidth / totalBars;


    drawBars(chartArea, datasets.cryptoCapitalization, '#4FB848', xScale, yScale, barWidth, 'left');
    drawBars(chartArea, datasets.valueSecured, '#E5C46B', xScale, yScale, barWidth, 'right');

    drawLegend(
      svg,
      [
        { label: 'Crypto Capitalization.', color: '#4FB848' },
        { label: 'Value Secured', color: '#E5C46B' },
      ],
      chartConfig,
      tooltipConfig
    );

    handleBarTooltip(
      svg,
      chartArea,
      { 'Total Crypto Capitalization': datasets.cryptoCapitalization, 'Value Secured': datasets.valueSecured },
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => formatNumber(value),
      { 'Total Crypto Capitalization': '#4FB848', 'Value Secured': '#E5C46B' },
      barWidth
    );

    svg.on('wheel', (event) =>
      handleWheel(event, xDomain, setXDomain, fetchDataForRange, new Date('2010-01-01'), new Date())
    );
  };

  // Set up responsiveness by tracking container width
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setWidth(chartRef.current.clientWidth);
      }
    };

    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set the xDomain based on chartType
  useEffect(() => {
    const now = new Date();
    let startDate: Date;

    switch (chartType) {
      case 'Daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Last 65 days
        break;
      case 'Weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 12 * 7); // Last 25 weeks (175 days)
        break;
      case 'Monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
        break;
      case 'Yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 5); // Last 5 years
        break;
      default:
        startDate = new Date('2010-01-01');
    }

    const endDate = now;
    setXDomain([startDate, new Date(endDate.setDate(endDate.getDate() +0))]);
    fetchDataForRange(startDate, endDate);
  }, [chartType]);

  // Redraw chart when datasets, xDomain, or width changes
  useEffect(() => {
    if (datasets.cryptoCapitalization.length > 0 && datasets.valueSecured.length > 0 && width > 0) {
      drawChart();
    }
  }, [datasets, xDomain, width]);

  return <div ref={chartRef} style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#1E1E1E' }} />;
};

export default PosTotalChartWidget;

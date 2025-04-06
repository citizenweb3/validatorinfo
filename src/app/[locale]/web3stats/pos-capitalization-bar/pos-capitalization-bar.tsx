import * as d3 from 'd3';
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateDataForTotalLine} from './generateDataForTotalBar';
import { formatNumber } from '../chartUtils/chartHelper';
import { FC } from 'react';
import { ChartConfig,TooltipConfig,DataPoint,setupChartArea, setupYScale, setupXScale, drawYAxis,drawXAxis,drawLegend, drawBars, handleBarTooltip,handleWheel } from '../chartUtils//barChartUtils';

interface ChartWidgetProps {
  chartType: string;
}

const PosCryptoCapitalizationAndValueSecured: FC<ChartWidgetProps> = ({ chartType }) => {
  const [datasets, setDatasets] = useState<{ tvs: DataPoint[]; rewards: DataPoint[] }>({ tvs: [], rewards: [] });
  const chartRef = useRef<HTMLDivElement>(null);
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2020-01-01'), new Date()]);
  const [width, setWidth] = useState(0);

  // Chart configuration with dynamic width
  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 400,
      margin: { top: 30, right: 0, bottom: 50, left: 0 }, // Adjusted top margin for Y-axis labels
      padding: { left: 60, right: 0, top: 50, bottom: 50 }, // Adjusted padding inside chart area
      gapLeft: 60, // Maintain the original gap between y-axis and lines
      gapRight: 100,
      leftOffset: 0,
      rightOffset: 0,
      xScalePadding: 60,
      legendOffset: 10, // Reduced legend offset
    }),
    [width]
  );

  // Tooltip configuration
  const tooltipConfig: TooltipConfig = {
    width: 280,
    rowHeight: 22,
    baseHeight: 30,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 165,
  };

  // Fetch data based on date range
  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const newDatasets = generateDataForTotalLine(startDate, endDate, chartType);
      setDatasets(newDatasets);
    }, 1);
  };

  // Function to draw the chart
  const drawChart = () => {
    const { svg, chartArea } = setupChartArea(chartRef, chartConfig);

    const { padding, gapLeft, margin, gapRight } = chartConfig;
    const chartWidth = chartConfig.width - margin.left - margin.right;
    const chartHeight = chartConfig.height - margin.top - margin.bottom;

    const plotLeft = padding.left + gapLeft;
    const plotRight = chartWidth - gapRight;
    
    // setup scales
    const xScale = setupXScale(xDomain, plotLeft, plotRight);
    const yScale = setupYScale([0, 2 * 10 ** 11], chartHeight, 'linear');
    
    // draw y-axis
    drawYAxis(svg, yScale, padding.left,padding.bottom, (d) => formatNumber(d, 2));

    // X-axis 
    drawXAxis(svg, xScale, chartConfig, chartType);

    // draw Bars
    
    drawBars(chartArea, datasets.tvs, '#4FB848', xScale, yScale, 30, 'left',chartConfig.padding.left, chartConfig.padding.bottom);
    drawBars(chartArea, datasets.rewards, '#E5C46B', xScale, yScale, 30, 'right',chartConfig.padding.left, chartConfig.padding.bottom);

    drawLegend(
      svg,
      [
        { label: 'Total Crypto Capitalization', color: '#4FB848' },
        { label: 'Value Secured', color: '#E5C46B' },
      ],
      chartConfig,
      tooltipConfig
    );

    handleBarTooltip(
      svg,
      chartArea,
      { 'Crypto Capitalization': datasets.tvs, 'Value Secured': datasets.rewards },
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => formatNumber(value),
      { 'Crypto Capitalization': '#4FB848', 'Value Secured': '#E5C46B' },
      chartType,
    );

    svg.on('wheel', (event) =>
      handleWheel(event, xDomain, setXDomain, fetchDataForRange, new Date('2010-01-01'), new Date())
    );
  };

  // Handle responsiveness by tracking container width
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

  // Set xDomain and fetch data based on chartType
  useEffect(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
  
    switch (chartType) {
      case 'Daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = d3.timeDay.floor(now); // Last completed day
        break;
      case 'Weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 12 * 7);
        endDate = d3.timeWeek.floor(now); // Last completed week
        break;
      case 'Monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12);
        endDate = d3.timeMonth.floor(now); // Last completed month
        break;
      case 'Yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 5);
        endDate = d3.timeYear.floor(now); // Last completed year
        break;
      default:
        startDate = new Date('2020-01-01');
        endDate = new Date(now);
    }
  
    setXDomain([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  }, [chartType]);

  // Redraw chart when datasets, xDomain, or width changes
  useEffect(() => {
    if (datasets.tvs.length > 0 && datasets.rewards.length > 0 && width > 0) {
      drawChart();
    }
  }, [datasets, xDomain, width]);

  return (
    <div
      ref={chartRef}
      style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#1E1E1E' }}
    />
  );
};

export default PosCryptoCapitalizationAndValueSecured;
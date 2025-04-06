import * as d3 from 'd3';
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateDataForTotalLine} from './generateDataForTotalLine';
import { formatNumber } from '../chartUtils/chartHelper';
import { FC } from 'react';
import { ChartConfig,setupChartArea, setupYScale, setupXScale, drawYAxis,drawXAxis,handleTooltip, drawLine } from '../chartUtils/lineChartUtils';
import {
  drawLegend,
  handleWheel,
  TooltipConfig,
  DataPoint,
} from '../chartUtils/barChartUtils';

interface ChartWidgetProps {
  chartType: string;
}

const PosTotalTVSAndRewardsPayout: FC<ChartWidgetProps> = ({ chartType }) => {
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
      gapRight: 120,
      leftOffset: 0,
      rightOffset: 0,
      xScalePadding: 60,
      legendOffset: 10, // Reduced legend offset
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

  // Fetch data based on date range
  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const newDatasets = generateDataForTotalLine(startDate, endDate, chartType);
      setDatasets(newDatasets);
    }, 1);
  };

  // Function to draw the chart
  const drawChart = () => {
    const { svg, plotArea} = setupChartArea(chartRef, chartConfig);

    const { padding, gapLeft, margin, gapRight } = chartConfig;
    const chartWidth = chartConfig.width - margin.left - margin.right;
    const chartHeight = chartConfig.height - margin.top - margin.bottom;

    const plotLeft = padding.left + gapLeft;
    const plotRight = chartWidth - gapRight;
    const plotWidth = chartConfig.width - chartConfig.padding.left - chartConfig.padding.right -100;
    const plotHeight = chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom ;
    
    // setup scales
    const xScale = setupXScale(xDomain, plotWidth);
    const yScale = setupYScale([0, 2 * 10 ** 11], chartHeight, 'linear');
    
    // draw y-axis
    drawYAxis(svg, yScale, padding.left,padding.bottom, (d) => formatNumber(d, 2));

    // X-axis 
    drawXAxis(plotArea, xScale, plotHeight, chartConfig, chartType);

    // draw lines
    const lineGenerator = d3.line<DataPoint>().x((d) => xScale(d.date)).y((d) => yScale(d.value));
    
    drawLine(plotArea, datasets.tvs,chartType, '#4FB848', lineGenerator);
    drawLine(plotArea, datasets.rewards,chartType, '#E5C46B', lineGenerator);

    drawLegend(
      svg,
      [
        { label: 'T.V.S.', color: '#4FB848' },
        { label: 'Rewards', color: '#E5C46B' },
      ],
      chartConfig,
      tooltipConfig
    );

    handleTooltip(
      svg,
      plotArea,
      { 'T.V.S': datasets.tvs, "Rewards": datasets.rewards },
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => formatNumber(value),
      { 'T.V.S': '#4FB848', 'Rewards': '#E5C46B' },
      plotLeft,
      plotRight,
      chartWidth,
      chartHeight,
      chartType
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

    switch (chartType) {
      case 'Daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 65); // Last 65 days
        break;
      case 'Weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 15 * 7); // Last 12 weeks (84 days)
        break;
      case 'Monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
        break;
      case 'Yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 12); // Last 5 years
        break;
      default:
        startDate = new Date('2020-01-01');
    }

    const endDate = new Date(now);
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

export default PosTotalTVSAndRewardsPayout;

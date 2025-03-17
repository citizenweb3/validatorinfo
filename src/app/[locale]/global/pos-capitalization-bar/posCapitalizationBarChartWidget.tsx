import * as d3 from 'd3';
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateDataForDays, formatNumber } from './generateCapitilizationAndValueSecured';
import { FC } from 'react';
import {
  drawBars,
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
} from '../pos-total-line/chartUtils';

interface ChartWidgetProps {
  chartType: string;
}

const PosTotalChartWidget: FC<ChartWidgetProps> = ({ chartType }) => {
  const [datasets, setDatasets] = useState<{ tvs: DataPoint[]; rewards: DataPoint[] }>({ tvs: [], rewards: [] });
  const chartRef = useRef<HTMLDivElement>(null);
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width, setWidth] = useState(0);

  // Define chartConfig with dynamic width using useMemo to optimize performance
  const chartConfig: ChartConfig = useMemo(
    () => ({
      width ,
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
    width: 180,
    rowHeight: 22,
    baseHeight: 30,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 50,
  };

  // Fetch data for the specified date range
  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const newDatasets = generateDataForDays(startDate, endDate, chartType,65);
      setDatasets(newDatasets);
    }, 1);
  };

  // Draw the chart with the current width
  const drawChart = () => {
    const { svg, chartArea } = setupChartArea(chartRef, chartConfig);

    // Define the clipping region
    const clipPathId = 'chart-clip-path';
    const clipPath = svg.select(`#${clipPathId}`);
    if (clipPath.empty()) {
      svg.append('defs')
        .append('clipPath')
        .attr('id', clipPathId)
        .append('rect')
        .attr('x', chartConfig.margin.left)
        .attr('y', chartConfig.margin.top)
        .attr('width', chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.xScalePadding)
        .attr('height', chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom);
    } else {
      clipPath.select('rect')
        .attr('x', chartConfig.margin.left)
        .attr('y', chartConfig.margin.top)
        .attr('width', chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.xScalePadding)
        .attr('height', chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom);
    }

    // Apply the clipping region to the chart area
    chartArea.attr('clip-path', `url(#${clipPathId})`);

    const xScale = setupXScale(xDomain, chartConfig);
    const yScale = setupYScale([0, 5 * 10 ** 12], chartConfig);

    drawXAxis(svg, xScale, chartConfig);
    drawYAxis(svg, yScale, chartConfig, (d) => formatNumber(d));

    // Calculate bar width
    const totalBars = datasets.tvs.length + datasets.rewards.length;
    const availableWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.leftOffset - chartConfig.rightOffset;
    const barWidth = availableWidth / totalBars;

    console.log('Total Bars:', totalBars);
    console.log('Bar Width:', barWidth);
    console.log('Chart Width:', chartConfig.width);
    console.log('Chart Height:', chartConfig.height);

    // Draw bars
    drawBars(chartArea, datasets.tvs, '#4FB848', xScale, yScale, barWidth, 'left');
    drawBars(chartArea, datasets.rewards, '#E5C46B', xScale, yScale, barWidth, 'right');

    drawLegend(
      svg,
      [
        { label: 'T.VS.', color: '#4FB848' },
        { label: 'Rewards', color: '#E5C46B' },
      ],
      chartConfig,
      tooltipConfig
    );

    handleBarTooltip(
      svg,
      chartArea,
      { tvs: datasets.tvs, rewards: datasets.rewards },
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => formatNumber(value),
      { tvs: '#4FB848', rewards: '#E5C46B' },
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
        startDate.setDate(now.getDate() - 65); // Last 65 days
        break;
      case 'Weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 25 * 7); // Last 25 weeks (175 days)
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
    setXDomain([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  }, [chartType]);

  // Redraw chart when datasets, xDomain, or width changes
  useEffect(() => {
    if (datasets.tvs.length > 0 && datasets.rewards.length > 0 && width > 0) {
      drawChart();
    }
  }, [datasets, xDomain, width]);

  return <div ref={chartRef} style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#1E1E1E' }} />;
};

export default PosTotalChartWidget;

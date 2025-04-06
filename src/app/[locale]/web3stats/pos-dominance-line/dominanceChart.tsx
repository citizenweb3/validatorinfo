import * as d3 from 'd3';
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateDataForDominanceLine } from './generateDataForDominanceLine';
import { FC } from 'react';
import { ECOSYSTEMS_CONFIG } from '../ecosystemConfig';
import { ChartConfig, setupChartArea, setupYScale, setupXScale, drawYAxis, drawXAxis, handleTooltip, drawLine } from '../chartUtils/lineChartUtils';
import { drawLegend, handleWheel, TooltipConfig, DataPoint } from '../chartUtils/barChartUtils';
import { formatNumber } from '../chartUtils/chartHelper';

interface ChartWidgetProps {
  chartType: string;
  ecosystems: string[];
}

const TotalDominanceChart: FC<ChartWidgetProps> = ({ chartType, ecosystems }) => {
  const [datasets, setDatasets] = useState<{ [key: string]: DataPoint[] }>({});
  const chartRef = useRef<HTMLDivElement>(null);
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width, setWidth] = useState(0);

  // Chart configuration with dynamic width
  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 400,
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

  const drawChart = () => {
    if (!chartRef.current) return;

    // Clear any previous SVG
    d3.select(chartRef.current).select('svg').remove();

    const { svg, plotArea } = setupChartArea(chartRef, chartConfig);

    const { padding, gapLeft, margin, gapRight } = chartConfig;
    const chartWidth = chartConfig.width - margin.left - margin.right;
    const chartHeight = chartConfig.height - margin.top - margin.bottom;

    const plotLeft = padding.left + gapLeft;
    const plotRight = chartWidth - gapRight;
    const plotWidth = chartConfig.width - chartConfig.padding.left - chartConfig.padding.right - 100;
    const plotHeight = chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom;

    // Setup scales
    const xScale = setupXScale(xDomain, plotWidth);
    const yScale = setupYScale([0, 100], chartHeight, 'linear');

    // Draw axes
    drawYAxis(svg, yScale, padding.left, padding.bottom, (d) => `${Number(d).toFixed(2)}%`);
    drawXAxis(plotArea, xScale, plotHeight, chartConfig, chartType);

    // Draw lines
    const lineGenerator = d3.line<DataPoint>().x((d) => xScale(d.date)).y((d) => yScale(d.value));
    const colors = ecosystems.reduce((acc, eco) => {
      acc[eco] = (ECOSYSTEMS_CONFIG as any)[eco]?.color || 'gray';
      return acc;
    }, {} as { [key: string]: string });

    ecosystems.forEach((ecosystem) => {
      if (datasets[ecosystem]) {
        drawLine(plotArea, datasets[ecosystem], chartType, colors[ecosystem], lineGenerator);
      }
    });

    // Dynamic legend items based on ecosystems
    const legendItems = ecosystems.map(ecosystem => ({
      label: ecosystem,
      color: colors[ecosystem]
    }));

    drawLegend(svg, legendItems, chartConfig, tooltipConfig);

    // Tooltip with ecosystem datasets and colors
    handleTooltip(
      svg,
      plotArea,
      datasets, // Pass all ecosystem datasets
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value, name) => formatNumber(value), // Include name parameter for flexibility
      colors, // Pass ecosystem colors
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

  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const newDatasets = generateDataForDominanceLine(startDate, endDate, chartType, ecosystems);
      setDatasets(newDatasets);
    }, 1);
  };

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
  }, [chartType, ecosystems]);

  useEffect(() => {
    if (Object.values(datasets).every(dataset => dataset.length > 0) && width > 0) drawChart();
  }, [datasets, xDomain, width]);

  return <div ref={chartRef} style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#1E1E1E' }} />;
};

export default TotalDominanceChart;

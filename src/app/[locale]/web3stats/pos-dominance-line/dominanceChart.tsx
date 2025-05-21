'use client';
import * as d3 from 'd3';
import { FC, useEffect, useRef, useState, useMemo } from 'react';
import {
  ChartConfig,
  setupChartArea,
  setupYScale,
  setupXScale,
  drawYAxis,
  drawXAxis,
  drawLine,
  handleWheel,
  TooltipConfig,
  DataPoint,
  drawLegend,
  handleTooltip,
} from '@/app/components/chart/chartUtils';
import { formatNumber } from '@/app/components/chart/chartHelper';
import { generateDataForDominanceLine } from './generateSampleDominance';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig';

interface TotalDominanceChartProps {
  chartType: string;
  ecosystems: string[];
}

const TotalDominanceChart: FC<TotalDominanceChartProps> = ({ chartType, ecosystems }) => {
  const [datasets, setDatasets] = useState<{ [key: string]: DataPoint[] }>({});
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width, setWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      width,
      height: 300,
      margin: { top: 30, right: 0, bottom: 50, left: 0 },
      padding: { left: 100, right: 0, top: 50, bottom: 50 },
      gapLeft: 60,
      gapRight: 120,
      leftOffset: 0,
      rightOffset: 0,
      xScalePadding: 60,
      legendOffset: 10,
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
    rightBoundaryOffset: 165,
  };

  const colors = useMemo(
    () =>
      ecosystems.reduce((acc, eco) => {
        acc[eco] = (ECOSYSTEMS_CONFIG as any)[eco]?.color || 'gray';
        return acc;
      }, {} as { [key: string]: string }),
    [ecosystems]
  );

  const drawChart = () => {
    if (!chartRef.current || !Object.values(datasets).some((data) => data.length > 0)) return;

    d3.select(chartRef.current).select('svg').remove();

    const { svg, plotArea } = setupChartArea(chartRef, chartConfig);
    const { padding, gapLeft, gapRight } = chartConfig;

    const chartWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
    const chartHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
    const plotWidth = chartWidth - chartConfig.padding.left - chartConfig.padding.right - 100;
    const plotHeight = chartHeight - chartConfig.padding.top - chartConfig.padding.bottom;

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', 10)
      .attr('y', 0)
      .attr('width', plotWidth - 10)
      .attr('height', chartConfig.height);

    const xScale = setupXScale(xDomain, plotWidth);
    const yScale = setupYScale([0, 100], chartHeight, 'linear');

    drawYAxis(svg, yScale, padding.left, padding.bottom, {
      tickFormat: (d) => `${Number(d).toFixed(2)}%`,
      usePercentage: true,
      fontFamily: 'Handjet',
      fontSize: '13.75px',
      labelOffset: -20,
    });
    drawXAxis(plotArea, xScale, plotHeight, chartConfig, chartType);

    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    ecosystems.forEach((ecosystem) => {
      if (datasets[ecosystem]) {
        drawLine(plotArea, datasets[ecosystem], chartType, colors[ecosystem], lineGenerator);
      } else {
        console.warn('Missing dataset for ecosystem:', ecosystem);
      }
    });

    const legendItems = ecosystems.map((ecosystem) => ({
      label: ecosystem,
      color: colors[ecosystem],
    }));
    drawLegend(svg, legendItems, chartConfig, tooltipConfig);

    handleTooltip(
      svg,
      plotArea,
      datasets,
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => `${formatNumber(value)}%`,
      colors,
      padding.left,
      chartWidth - padding.right,
      plotWidth,
      plotHeight,
      chartType,
      true
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
    if (Object.values(datasets).some((data) => data.length > 0) && width > 0) {
      drawChart();
    }
  }, [datasets, xDomain, width]);



  return (
    <div className="mt-3 mb-12">
      <div
        ref={chartRef}
        style={{
          position: 'relative',
          width: '90%',
          minWidth: '300px',
          height: '300px',
          backgroundColor: '#1E1E1E',
        }}
        className="mt-3 px-4 sm:px-10 md:px-20 w-full"
      />
    </div>
  );
};

export default TotalDominanceChart;
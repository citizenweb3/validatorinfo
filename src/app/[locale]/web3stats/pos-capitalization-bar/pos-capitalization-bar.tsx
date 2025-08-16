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
  handleTooltip
} from '@/app/components/chart/chartUtils';
import { formatNumber } from '@/app/components/chart/chartHelper';
import { generateSampleData } from '@/app/components/chart/sampleData';
import { drawBars, handleBarTooltip } from '@/components/chart/barChartUtils';

interface PosCapitalizationBarChartWidget  {
  chartType: "Daily" | "Weekly" | "Monthly" | "Yearly";
}


const PosCapitalizationBarChartWidget : FC<PosCapitalizationBarChartWidget > = ({ chartType }) => {
  // Define ecosystems and their colors (can be extended as needed)
  const LegendLabels = ['Total Crypto Capitalization', 'Value Secured'];
  const colorMapLegends = { 'Total Crypto Capitalization': '#E5C46B', 'Value Secured': '#4FB848' };
  const Labels = ['Crypto Capitalization', 'Value Secured'];
  const colorMap = { 'Crypto Capitalization': '#E5C46B', 'Value Secured': '#4FB848', };
  const startingPrices = {
    'Crypto Capitalization': 9000000,
    'Value Secured': 7000000,
  };


  const [isChart, setIsChart] = useState<boolean>(true);
  const [datasets, setDatasets] = useState<{ [Labels: string]: DataPoint[] }>({});
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

  const drawChart = () => {
    if (!chartRef.current || !Object.values(datasets).some(data => data.length > 0)) return;

    d3.select(chartRef.current).select('svg').remove();

    const { svg, plotArea } = setupChartArea(chartRef, chartConfig);
    const { padding } = chartConfig;

    const chartWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
    const chartHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;
    const plotWidth = chartWidth - chartConfig.padding.left - chartConfig.padding.right - 100;
    const plotHeight = chartHeight - chartConfig.padding.top - chartConfig.padding.bottom;

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clipBar')
      .append('rect')
      .attr('x', 60)
      .attr('y', 0)
      .attr('width', plotWidth - 10)
      .attr('height', chartConfig.height);

    const xScale = setupXScale(xDomain, plotWidth);

    // Collect all valid values for y-domain calculation
    const allValues: number[] = Labels.flatMap(label =>
      datasets[label]?.map(d => d.value).filter(v => v !== null && v !== undefined) || []
    );

    if (allValues.length === 0) {
      console.warn('No valid data available to draw the chart');
      return;
    }

    const yMax = Math.max(...allValues);
    const yMinValue =0; // Actual minimum from data
    const yScale = setupYScale([yMinValue, yMax * 1.2], chartHeight, 'linear');

    drawYAxis(svg, yScale, padding.left, padding.bottom, {
      tickFormat: (d) => `$${Number(d).toFixed(2)}`,
      usePercentage: false,
      fontFamily: 'Handjet',
      fontSize: '13.75px',
      labelOffset: -30
    });
    drawXAxis(plotArea, xScale, plotHeight, chartConfig, chartType);

    const lineGenerator = d3.line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw a line for each ecosystem
    drawBars(plotArea, datasets['Value Secured'], '#4FB848', xScale, yScale, 35, 'left', chartConfig.padding.left, chartConfig.padding.bottom,chartType);
    drawBars(plotArea, datasets['Crypto Capitalization'], '#E5C46B', xScale, yScale, 35, 'right', chartConfig.padding.left, chartConfig.padding.bottom,chartType);



    // Tooltip for all ecosystems
    handleBarTooltip(
      svg,
      plotArea,
      datasets,
      xScale,
      yScale,
      chartConfig,
      tooltipConfig,
      (value) => `$${formatNumber(value)}`,
      colorMap,
      chartType
    );

    // Dynamic legend
    const legendItems = LegendLabels.map(label => ({
      label: label,
      color: colorMapLegends[label as keyof typeof colorMapLegends],
    }));
    drawLegend(svg, legendItems, chartConfig, tooltipConfig);

    svg.on('wheel', (event) =>
      handleWheel(event, xDomain, setXDomain, fetchDataForRange, new Date('2010-01-01'), new Date())
    );
  };

  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const data = Labels.reduce((acc, label, index) => {
        const labelData = generateSampleData(startDate, endDate, chartType, [label], {
          startingPrice: Object.values(startingPrices)[index], // Access startingPrices with numeric index
          volatility: 0.1,
          regenerate: true,
        });
        return { ...acc, [label]: labelData[label] };
      }, {});
      setDatasets(data);
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
        startDate.setDate(now.getDate() - 25);
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

  useEffect(() => {
    if (Object.values(datasets).some(data => data.length > 0) && width > 0 && isChart) {
      drawChart();
    }
  }, [datasets, width, isChart]);

  useEffect(() => {
    if (isChart) {
      drawChart();
    }
  }, [isChart]);

  return (
        <div
          ref={chartRef}
          style={{
            position: 'relative',
            width: '90%',
            minWidth: '1300px',
            height: '300px',
            backgroundColor: '#1E1E1E',
          }}
          className="mt-3 w-full"
        />
  );
};

export default PosCapitalizationBarChartWidget;
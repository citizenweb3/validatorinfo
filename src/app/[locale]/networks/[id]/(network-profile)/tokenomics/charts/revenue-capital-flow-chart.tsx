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
  handleWheel,
  TooltipConfig,
  DataPoint,
  drawLegend,
  handleTooltip
} from '@/app/components/chart/chartUtils';
import { formatNumber } from '@/app/components/chart/chartHelper';
import { generateSampleData} from '@/app/components/chart/sampleData';

const RevenueCapitalFlowChart: FC = () => {
  // Define ecosystems and their colors (can be extended as needed)
  const Labels = ['Capital Out', 'Capital In', 'Revenue'];
  const colorMap = {
    'Capital Out': '#E5C46B',
    'Capital In': '#4FB848',
    'Revenue': '#2077E0',
  };
  const startingPrices = {
    'Capital Out': 50000000,
    'Capital In': 30000000,
    'Revenue': 10000000,
  };
  

  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
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
      .attr('id', 'clip-revenue')
      .append('rect')
      .attr('x', 100)
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
  
    const yMax = d3.max(allValues) ?? 100;
    const yMinValue = - 10000000; // Actual minimum from data
    const yScale = setupYScale([yMinValue * 0.95, yMax * 1.05], chartHeight, 'linear');
  
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
    Labels.forEach((label) => {
      if (datasets[label]) {
        const pathData = lineGenerator(datasets[label]);
        if (pathData) {
          drawLine(plotArea, datasets[label], chartType, colorMap[label as keyof typeof colorMap], lineGenerator);
        } else {
          console.warn(`Skipping drawing for ${label} because path is null`);
        }
      }
    });
  
    // Draw the white line at the minimum value
    const minLineDataset: DataPoint[] = [
      { date: xScale.invert(0), value: yMinValue },
      { date: xScale.invert(plotWidth), value: yMinValue },
    ];
    svg.append('path')
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round')
      .attr('d', lineGenerator(minLineDataset));
  
    // Tooltip for all ecosystems
    handleTooltip(
      svg,
      plotArea,
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
      false
    );
  
    // Dynamic legend
    const legendItems = Labels.map(label => ({
      label: label,
      color: colorMap[label as keyof typeof colorMap],
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
          volatility: 0.03,
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
    <div className="mt-3 mb-12">
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
      ) : (
        <div className="mt-3 px-14 text-center text-white text-lg">
          Chart is disabled. Toggle to view chart.
        </div>
      )}
    </div>
  );
};

export default RevenueCapitalFlowChart;
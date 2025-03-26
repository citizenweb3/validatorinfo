import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { generateDataForDominanceLine } from './generateDataForDominanceLine';
import { FC } from 'react';
import { ECOSYSTEMS_CONFIG } from '../ecosystemConfig';
import { drawLine, handleTooltip, drawLegend, ChartConfig, TooltipConfig, DataPoint, handleWheel, drawXAxis, drawYAxis } from '../chartUtils';

interface ChartWidgetProps {
  chartType: string;
  ecosystems: string[];
}

const TotalDominanceChart: FC<ChartWidgetProps> = ({ chartType, ecosystems }) => {
  const [datasets, setDatasets] = useState<{ [key: string]: DataPoint[] }>({});
  const chartRef = useRef<HTMLDivElement>(null);
  const [xDomain, setXDomain] = useState<[Date, Date]>([new Date('2010-01-01'), new Date()]);
  const [width, setWidth] = useState(0);

  const chartConfig: ChartConfig = {
    width,
    height: 300,
    margin: { top: 5, right: 70, bottom: 40, left: 70 },
    leftOffset: 30,
    rightOffset: 30,
    xScalePadding: 60,
    legendOffset: 20,
  };

  const tooltipConfig: TooltipConfig = {
    width: 180,
    rowHeight: 22,
    baseHeight: 30,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 100,
  };

  const xScale = d3.scaleUtc().domain(xDomain).range([chartConfig.margin.left, chartConfig.width - chartConfig.margin.right + chartConfig.xScalePadding]);
  const yScale = d3.scaleLinear().domain([0, 100]).range([chartConfig.height - chartConfig.margin.bottom, chartConfig.margin.top]);

  const drawChart = () => {
    if (!chartRef.current) return;
  
    // Clear any previous SVG (in case of re-rendering)
    d3.select(chartRef.current).select('svg').remove();
  
    // Create the new SVG and chart area
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', chartConfig.width)
      .attr('height', chartConfig.height + 20);
  
    const chartArea = svg.append('g')
      .attr('clip-path', 'url(#chart-clip)')
      .attr('transform', `translate(${chartConfig.leftOffset}, 0)`);
  
    // Add clipping path
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('x', chartConfig.margin.left)
      .attr('y', chartConfig.margin.top)
      .attr('width', chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.leftOffset - chartConfig.rightOffset + 35)
      .attr('height', chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom);
  
    // Set scales for the axes
    const xScale = d3.scaleUtc().domain(xDomain).range([chartConfig.margin.left, chartConfig.width - chartConfig.margin.right + chartConfig.xScalePadding]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartConfig.height - chartConfig.margin.bottom, chartConfig.margin.top]);
  
    // Draw the x-axis
    drawXAxis(svg, xScale, chartConfig, chartType);
  
    // Draw the y-axis
    drawYAxis(svg, yScale, chartConfig, (d) => `${Number(d).toFixed(2)}%`, 5);
  
    // Draw lines and legends for ecosystems (same logic as before)
    const lineGenerator = d3.line<DataPoint>().x(d => xScale(d.date)).y(d => yScale(d.value));
  
    const colors = ecosystems.reduce((acc, eco) => {
      acc[eco] = (ECOSYSTEMS_CONFIG as any)[eco]?.color || 'gray';
      return acc;
    }, {} as { [key: string]: string });
  
    ecosystems.forEach((ecosystem) => {
      if (datasets[ecosystem]) drawLine(chartArea, datasets[ecosystem], colors[ecosystem], lineGenerator);
    });
  
    const legendItems = ecosystems.map(ecosystem => ({
      label: ecosystem,
      color: colors[ecosystem]
    }));
  
    drawLegend(svg, legendItems, chartConfig, tooltipConfig);
  
    handleTooltip(svg, chartArea, datasets, xScale, yScale, chartConfig, tooltipConfig,
      (value) => `${value.toFixed(2)}%`,
      colors
    );
  
    svg.on('wheel', (event) => handleWheel(
      event,
      xDomain,
      setXDomain,
      fetchDataForRange,
      new Date('2010-01-01'),
      new Date(),
      1 // zoomStep
    ));
  };
  

  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    setTimeout(() => {
      const newDatasets: { [key: string]: DataPoint[] } = {};
      ecosystems.forEach((ecosystem) => {
        newDatasets[ecosystem] = generateDataForDominanceLine(startDate, endDate, chartType);
      });
      setDatasets(newDatasets);
    }, 1);
  };

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
    setXDomain([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  }, [chartType, ecosystems]);

  useEffect(() => {
    if (Object.values(datasets).every(dataset => dataset.length > 0) && width > 0) drawChart();
  }, [datasets, xDomain, width]);

  return <div ref={chartRef} style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#1E1E1E' }} />;
};

export default TotalDominanceChart;
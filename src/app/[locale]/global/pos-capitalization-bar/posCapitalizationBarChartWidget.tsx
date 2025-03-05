import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { generateDataForDays, formatNumber } from './generateCapitilizationAndValueSecured'; // Utility function for generating data
import { FC } from 'react';

type DataPoint = {
  date: Date;
  value: number;
  formattedValue: string; // Store the formatted value
};

interface ChartWidgetProps {
  chartType: string; // Prop to determine chart type (Daily, Weekly, Monthly, Yearly)
}

const PosTotalChartWidget: FC<ChartWidgetProps> = ({ chartType }) => {
  const [datasets, setDatasets] = useState<{ tvs: DataPoint[]; rewards: DataPoint[] }>({
    tvs: [],
    rewards: [],
  });

  const chartRef = useRef<HTMLDivElement>(null); // Ref to reference the div containing the chart

  // Configuration for chart dimensions and scales
  const chartConfig = {
    width: 1100,
    height: 200,
    margin: { top: 5, right: 20, bottom: 40, left: 70 },
    padding: 0,
    minDate: new Date('2021-01-01'), // Minimum date for x-axis
    leftOffset: 30,
    rightOffset: 30,
    yTicks: 5, // Number of ticks on y-axis
    legendOffset: 20,
    xScalePadding: 20,
    yLabelOffset: -20,
    zoomStep: 1,
  };

  // Tooltip configuration
  const tooltipConfig = {
    width: 280,
    rowHeight: 22,
    baseHeight: 30,
    squareSize: 10,
    squareOffset: 6,
    xOffset: 10,
    yOffset: 20,
    boundaryPadding: 10,
    rightBoundaryOffset: 50,
  };

  // State for x-axis domain (start and end dates)
  const [xDomain, setXDomain] = useState<[Date, Date]>([chartConfig.minDate, new Date()]);

  // Calculate chart area width and height based on configuration
  const chartAreaWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.leftOffset - chartConfig.rightOffset;
  const chartAreaHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  // Scales for x and y axes using d3
  const xScale = d3.scaleUtc()
    .domain(xDomain)
    .range([chartConfig.margin.left, chartConfig.width - chartConfig.margin.right + chartConfig.xScalePadding]);

  const yScale = d3.scaleLinear()
    .domain([0, 5 * 10**12]) // Adjusted y-axis range to 0 to 10 trillion
    .range([chartConfig.height - chartConfig.margin.bottom, chartConfig.margin.top]);

  // Handle zooming by scrolling (wheel event)
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? chartConfig.zoomStep : -chartConfig.zoomStep;
    const [start, end] = xDomain;
    const newStart = new Date(start);
    const newEnd = new Date(end);

    newStart.setMonth(newStart.getMonth() + delta);
    newEnd.setMonth(newEnd.getMonth() + delta);

    if (newStart >= chartConfig.minDate && newEnd <= new Date()) {
      setXDomain([newStart, newEnd]);
      fetchDataForRange(newStart, newEnd);
    }
  };

  // Function to draw the chart
  const drawChart = () => {
    if (!chartRef.current) return;

    // Remove existing svg element before drawing a new one
    d3.select(chartRef.current).select('svg').remove();

    // Append svg element to the chart container
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', chartConfig.width)
      .attr('height', chartConfig.height + 20);

    const chartArea = svg.append('g')
      .attr('clip-path', 'url(#chart-clip)')
      .attr('transform', `translate(${chartConfig.leftOffset}, 0)`);

    // Clip path to limit rendering within the chart area
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('x', chartConfig.margin.left - chartConfig.leftOffset)
      .attr('y', chartConfig.margin.top)
      .attr('width', chartAreaWidth)
      .attr('height', chartAreaHeight);

    // Update the x and y scales based on the current domain
    xScale.domain(xDomain);
    yScale.domain([0, 5 * 10**12]); // Adjusted y-axis range to 5 to 50 trillion (or your max value)

    // Append x-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartConfig.height - chartConfig.margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll('path, line')
      .attr('stroke', '#3E3E3E');

    // Append y-axis with custom tick formatting
    const yAxisGroup = svg.append('g')
      .attr('transform', `translate(${chartConfig.margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(chartConfig.yTicks).tickSizeOuter(0).tickSizeInner(0)
        .tickFormat((d) => formatNumber(d)) // Use formatNumber function to format the ticks
      );

    // Style the domain and ticks
    yAxisGroup.select('.domain')
      .attr('stroke', '#3E3E3E');

    yAxisGroup.selectAll('.tick text')
      .attr('fill', '#FFFFFF')
      .attr('x', chartConfig.yLabelOffset);

    // Function to render the bars for TVS and Rewards datasets
    const renderBars = (dataset: DataPoint[], color: string, section: 'left' | 'right') => {
      if (!dataset || dataset.length === 0) return;

      const barWidth = chartAreaWidth / (datasets.tvs.length + datasets.rewards.length);

      chartArea.selectAll(`.bar-${section}`)
        .data(dataset)
        .enter()
        .append('rect')
        .attr('class', `bar bar-${section}`)
        .attr('x', d => {
          const xPos = xScale(d.date);
          return section === 'left' ? xPos - barWidth / 4 : xPos + barWidth / 4;
        })
        .attr('y', d => yScale(d.value))
        .attr('width', barWidth / 2)
        .attr('height', d => yScale(0) - yScale(d.value)) // Corrected height to eliminate gap
        .attr('fill', color)
        .attr('stroke', 'none'); // Initially no stroke
    };

    // Render bars for TVS and Rewards datasets
    renderBars(datasets.tvs, '#4FB848', 'left');
    renderBars(datasets.rewards, '#E5C46B', 'right');

    // Legend for the chart
    const legend = svg.append('g')
      .attr('transform', `translate(${chartConfig.width / 2}, ${chartConfig.height - chartConfig.margin.bottom + chartConfig.legendOffset + 30})`);

    const legendItems = [
      { label: 'Total Crypto Capitalization', color: '#4FB848' },
      { label: 'Value Secured', color: '#E5C46B' },
    ];

    // Calculate the total width of all legend items
    const totalWidth = legendItems.length * 200;

    // Calculate the starting x position to center the legend items
    const startX = -totalWidth / 2;

    legendItems.forEach((item, index) => {
      const itemX = startX + index * 200;

      legend.append('rect')
        .attr('x', itemX)
        .attr('y', 0) // Keep y as 0 to maintain the vertical position within the legend group
        .attr('width', tooltipConfig.squareSize)
        .attr('height', tooltipConfig.squareSize)
        .attr('fill', item.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

      legend.append('text')
        .attr('x', itemX + 20)
        .attr('y', tooltipConfig.squareSize)
        .attr('fill', '#FFFFFF')
        .attr('font-size', '10px')
        .text(item.label);
    });

    // Mousemove event to show the tooltip and vertical dotted line
    svg.on('mousemove', (event) => {
      // Remove all existing dynamic tooltip elements to prevent overlap
      chartArea.selectAll('.dotted-line, .intersection-square, .ecosystem-square, .tooltip-text').remove();

      // Get mouse coordinates relative to the SVG
      const [mouseX, mouseY] = d3.pointer(event, svg.node());

      // Convert mouse X position to a date using the xScale
      const mouseDate = xScale.invert(mouseX);

      // Find closest y-values for the datasets
      const yValues = [
        { name: 'Total Crypto Capitalization', value: findClosestValue(datasets.tvs, mouseDate) },
        { name: 'Value Secured', value: findClosestValue(datasets.rewards, mouseDate) },
      ];

      // Define chart boundaries for clamping
      const chartLeft = chartConfig.margin.left;
      const chartRight = chartConfig.width - tooltipConfig.rightBoundaryOffset;

      // Adjust for any transformation on chartArea (e.g., translate)
      const transform = chartArea.attr('transform');
      let offsetX = 0;
      if (transform) {
        const match = transform.match(/translate\(([^,]+),/);
        if (match) offsetX = parseFloat(match[1]); // Extract x-translation
      }

      // Adjust mouseX by the transformation offset and clamp it
      const adjustedMouseX = mouseX - offsetX;
      const clampedMouseX = Math.max(chartLeft, Math.min(adjustedMouseX, chartRight));

      // Highlight the closest bars
      yValues.forEach((data) => {
        const dataset = data.name === 'Total Crypto Capitalization' ? datasets.tvs : datasets.rewards;
        if (dataset) {
          const closestDataPoint = dataset.reduce((a, b) =>
            Math.abs(xScale(a.date) - clampedMouseX) < Math.abs(xScale(b.date) - clampedMouseX) ? a : b
          );

          chartArea.selectAll(`.bar-${data.name === 'Total Crypto Capitalization' ? 'left' : 'right'}`)
            .each(function (d) {
              const dataPoint = d as DataPoint;
              d3.select(this).attr('stroke', dataPoint.date === closestDataPoint.date ? 'white' : 'none');
            })
            .attr('stroke-width', 1);
        }
      });

      // Draw the dotted line at the clamped position
      chartArea.append('line')
        .attr('class', 'dotted-line')
        .attr('x1', clampedMouseX)
        .attr('y1', chartConfig.margin.top)
        .attr('x2', clampedMouseX)
        .attr('y2', chartConfig.height - chartConfig.margin.bottom)
        .attr('stroke', '#E5C46B')
        .attr('stroke-dasharray', '2, 2');

      // Calculate tooltip position
      const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
      let tooltipX = clampedMouseX + tooltipConfig.xOffset;
      let tooltipY = chartConfig.margin.top + tooltipConfig.yOffset;

      // Adjust tooltip position to stay within chart boundaries
      if (tooltipX + tooltipConfig.width > chartConfig.width - chartConfig.margin.right) {
        tooltipX = clampedMouseX - tooltipConfig.width - tooltipConfig.boundaryPadding;
      }
      if (tooltipY + tooltipHeight > chartConfig.height - chartConfig.margin.bottom) {
        tooltipY = chartConfig.height - chartConfig.margin.bottom - tooltipHeight - tooltipConfig.boundaryPadding;
      }

      // Create or update the tooltip box
      let tooltipBox = chartArea.select<SVGRectElement>('.tooltip-box');
      if (tooltipBox.empty()) {
        tooltipBox = chartArea.append('rect')
          .attr('class', 'tooltip-box')
          .attr('x', tooltipX)
          .attr('y', tooltipY)
          .attr('width', tooltipConfig.width)
          .attr('height', tooltipHeight)
          .attr('fill', '#1E1E1E')
          .style('filter', 'drop-shadow(0px 4px 8px rgb(0, 0, 0))');
      } else {
        tooltipBox
          .attr('x', tooltipX)
          .attr('y', tooltipY)
          .attr('width', tooltipConfig.width)
          .attr('height', tooltipHeight);
      }

      // Update tooltip text
      chartArea.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + tooltipConfig.xOffset)
        .attr('y', tooltipY + 20)
        .attr('fill', '#E5C46B')
        .attr('font-size', '10px')
        .text(`${mouseDate.toISOString().split('T')[0]}`);

      // Add dataset-specific tooltip content
      yValues.forEach((data, i) => {
        const color = data.name === 'Total Crypto Capitalization' ? '#4FB848' : '#E5C46B';
        const yPosition = tooltipY + 40 + i * tooltipConfig.rowHeight;

        chartArea.append('rect')
          .attr('class', 'ecosystem-square')
          .attr('x', tooltipX + tooltipConfig.xOffset)
          .attr('y', yPosition - 5)
          .attr('width', tooltipConfig.squareSize)
          .attr('height', tooltipConfig.squareSize)
          .attr('fill', color)
          .attr('stroke', 'white')
          .attr('stroke-width', 1);

        chartArea.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + 30)
          .attr('y', yPosition)
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .attr('dominant-baseline', 'middle')
          .text(data.name);

        chartArea.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + 220)
          .attr('y', yPosition)
          .attr('fill', color)
          .attr('font-size', '10px')
          .attr('dominant-baseline', 'middle')
          .text(data.value);
      });
    });

    svg.on('wheel', handleWheel); // Attach zoom handler to the wheel event
  };

  // Find the closest value from the dataset for a given date
  const findClosestValue = (dataset: DataPoint[], targetDate: Date) => {
    const closest = dataset.reduce((a, b) =>
      Math.abs(a.date.getTime() - targetDate.getTime()) < Math.abs(b.date.getTime() - targetDate.getTime()) ? a : b
    );
    return closest.formattedValue; // Return formatted value
  };

  // Fetch new data for the chart based on the xDomain range
  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    console.log(`Fetching data for range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    setTimeout(() => {
      const newDatasets = generateDataForDays(startDate, endDate, chartType, 35);
      setDatasets(newDatasets);
      console.log(`Data fetched successfully for range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }, 1);
  };

  // Effect to set the initial xDomain and fetch data when chartType changes
  useEffect(() => {
    const now = new Date();
    let startDate = new Date('2021-01-01');
    const endDate = now;

    if (chartType === 'Daily') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 34); // 35 days including today
    } else if (chartType === 'Weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (34 * 7)); // 35 weeks
    } else if (chartType === 'Monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 34); // 35 months
    } else if (chartType === 'Yearly') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 34); // 35 years
    }

    setXDomain([startDate, endDate]);
    const newDatasets = generateDataForDays(startDate, endDate, chartType, 35);
    setDatasets(newDatasets);
  }, [chartType]);

  // Effect to draw the chart whenever datasets or xDomain change
  useEffect(() => {
    if (datasets.tvs.length > 0 && datasets.rewards.length > 0) {
      drawChart(); // Draw the chart if datasets are loaded
    }
  }, [datasets, xDomain]);

  return (
    <div
      ref={chartRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#1E1E1E', // Set background color for the chart area
      }}
    ></div>
  );
};

export default PosTotalChartWidget;



import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { generateDataForDays } from './data'; // Ensure this function generates data correctly
import { FC } from 'react';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import centralized ecosystem config

interface ChartWidgetProps {
  chartType: string; // Type of the chart (Daily, Weekly, Monthly, Yearly)
  ecosystems: string[]; // List of ecosystems to display on the chart
}

interface DataPoint {
  date: Date; // Date of the data point
  value: number; // Value of the data point (e.g., percentage)
}

const TotalDominanceChart: FC<ChartWidgetProps> = ({ chartType, ecosystems }) => {
  const [datasets, setDatasets] = useState<{ [key: string]: DataPoint[] }>({});
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: string; y: { name: string; value: string }[] }>({ x: '', y: [] });

  const chartConfig = {
    width: 1100,
    height: 200,
    margin: { top: 5, right: 20, bottom: 30, left: 60 },
    padding: 0,
    minDate: new Date('2021-01-01'),
    leftOffset: 30,
    rightOffset: 30,
    yTicks: 5,
    legendOffset: 20,
    xScalePadding: 20,
    yLabelOffset: -20,
    zoomStep: 1,
  };

  const tooltipConfig = {
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

  const [xDomain, setXDomain] = useState<[Date, Date]>([chartConfig.minDate, new Date()]);

  const chartAreaWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.leftOffset - chartConfig.rightOffset + 35;
  const chartAreaHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  const xScale = d3.scaleUtc()
    .domain(xDomain)
    .range([chartConfig.margin.left, chartConfig.width - chartConfig.margin.right + chartConfig.xScalePadding]);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([chartConfig.height - chartConfig.margin.bottom, chartConfig.margin.top]);

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

  const drawChart = () => {
    if (!chartRef.current) return;

    d3.select(chartRef.current).select('svg').remove();

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', chartConfig.width)
      .attr('height', chartConfig.height + 20);

    const chartArea = svg.append('g')
      .attr('clip-path', 'url(#chart-clip)')
      .attr('transform', `translate(${chartConfig.leftOffset}, 0)`);

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('x', chartConfig.margin.left)
      .attr('y', chartConfig.margin.top)
      .attr('width', chartAreaWidth)
      .attr('height', chartAreaHeight);

    xScale.domain(xDomain);
    yScale.domain([0, 100]);

    svg.append('g')
      .attr('transform', `translate(0,${chartConfig.height - chartConfig.margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll('path, line')
      .attr('stroke', '#3E3E3E');

    const yAxisGroup = svg.append('g')
      .attr('transform', `translate(${chartConfig.margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(chartConfig.yTicks)
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .tickFormat(d => `${d}%`)); // Format y-axis labels as percentages

    yAxisGroup.select('.domain')
      .attr('stroke', '#3E3E3E');

    yAxisGroup.selectAll('.tick text')
      .attr('fill', '#FFFFFF')
      .attr('x', chartConfig.yLabelOffset);


    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    const renderLine = (dataset: DataPoint[], color: string, trimPixels: number = 5) => {
      if (dataset.length === 0) return;

      const fullLine = lineGenerator(dataset);

      chartArea.append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("d", fullLine)
        .style("filter", "none");

      chartArea.append('path')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('d', fullLine)
        .style('filter', 'drop-shadow(0px 2px 2px rgb(0, 0, 0)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.81)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.62))')
        .attr('stroke-linecap', 'round');
    };

    ecosystems.forEach((ecosystem) => {
      const dataset = datasets[ecosystem];
      if (dataset) renderLine(dataset, (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color || 'gray');
    });

    const legend = svg.append('g')
  .attr('transform', `translate(${chartConfig.width / 2}, ${chartConfig.height - chartConfig.margin.bottom + chartConfig.legendOffset + 20})`);

const legendItems = ecosystems.map(ecosystem => ({
  label: ecosystem,
  color: (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color || 'gray'
}));

// Calculate the total width of all legend items
const totalWidth = legendItems.length * 100;

// Calculate the starting x position to center the legend items
const startX = -totalWidth / 2;

legendItems.forEach((item, index) => {
  const itemX = startX + index * 100;

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

  

    svg.on('mousemove', (event) => {
      // Get mouse coordinates relative to the SVG
      const [mouseX, mouseY] = d3.pointer(event, svg.node());

      // Convert mouse X position to a date using the xScale
      const mouseDate = xScale.invert(mouseX);

      // Find closest y-values for each ecosystem
      const yValues = ecosystems.map(ecosystem => {
        const dataset = datasets[ecosystem];
        if (!dataset) return { name: ecosystem, value: 'N/A' };

        const closest = dataset.reduce((a, b) =>
          Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b
        );

        return { name: ecosystem, value: `${closest.value.toFixed(2)}%` };
      });

      // Update tooltip data
      setTooltip({
        x: mouseDate.toISOString().split('T')[0],
        y: yValues,
      });

      // Remove existing tooltip elements
      chartArea.selectAll('.dotted-line, .tooltip-box, .tooltip-text, .ecosystem-square, .intersection-square').remove();

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
      chartArea.append('rect')
        .attr('class', 'tooltip-box')
        .attr('x', tooltipX)
        .attr('y', tooltipY)
        .attr('width', tooltipConfig.width)
        .attr('height', tooltipHeight)
        .attr('fill', '#1E1E1E')
        .style('filter', 'drop-shadow(0px 4px 8px rgb(0, 0, 0))');

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
        const color = (ECOSYSTEMS_CONFIG as any)[data.name]?.color || 'gray';
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
          .attr('x', tooltipX + 120)
          .attr('y', yPosition)
          .attr('fill', color)
          .attr('font-size', '10px')
          .attr('dominant-baseline', 'middle')
          .text(data.value);
      });

      // Highlight the closest data points
      yValues.forEach((data) => {
        const dataset = datasets[data.name];
        if (dataset) {
          const closestDataPoint = dataset.reduce((a, b) =>
            Math.abs(xScale(a.date) - clampedMouseX) < Math.abs(xScale(b.date) - clampedMouseX) ? a : b
          );

          const intersectionY = yScale(closestDataPoint.value);

          chartArea.append('rect')
            .attr('class', 'intersection-square')
            .attr('x', clampedMouseX - tooltipConfig.squareOffset)
            .attr('y', intersectionY - tooltipConfig.squareOffset)
            .attr('width', tooltipConfig.squareSize)
            .attr('height', tooltipConfig.squareSize)
            .attr('fill', (ECOSYSTEMS_CONFIG as any)[data.name]?.color || 'gray')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .transition()
            .duration(100)
            .ease(d3.easeLinear);
        }
      });
    });


    svg.on('wheel', handleWheel);
  };

  const fetchDataForRange = (startDate: Date, endDate: Date) => {
    console.log(`Fetching data for range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    setTimeout(() => {
      const newDatasets: { [key: string]: DataPoint[] } = {};
      ecosystems.forEach((ecosystem) => {
        newDatasets[ecosystem] = generateDataForDays(startDate, endDate, chartType);
      });
      setDatasets(newDatasets);
      console.log(`Data fetched successfully for range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }, 1);
  };

  useEffect(() => {
    const now = new Date();
    let startDate = new Date('2021-01-01');
    let endDate = new Date(now);

    const dateOffsets = {
      Daily: 12,
      Weekly: 12 * 7,
      Monthly: 12,
      Yearly: 3,
    };

    if (chartType in dateOffsets) {
      const midPoint = new Date(now);
      const halfOffset = dateOffsets[chartType as keyof typeof dateOffsets] / 2;
      if (chartType === 'Monthly') {
        startDate = new Date(midPoint.setMonth(midPoint.getMonth() - halfOffset));
        endDate = new Date(midPoint.setMonth(midPoint.getMonth() + halfOffset));
      } else if (chartType === 'Yearly') {
        startDate = new Date(midPoint.setFullYear(midPoint.getFullYear() - halfOffset));
        endDate = new Date(midPoint.setFullYear(midPoint.getFullYear() + halfOffset));
      } else {
        startDate = new Date(midPoint.setDate(midPoint.getDate() - halfOffset));
        endDate = new Date(midPoint.setDate(midPoint.getDate() + halfOffset));
      }
    }

    setXDomain([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  }, [chartType, ecosystems]);

  useEffect(() => {
    if (Object.values(datasets).every(dataset => dataset.length > 0)) {
      drawChart();
    }
  }, [datasets, xDomain, ecosystems, chartType]);

  return (
    <div
      ref={chartRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#1E1E1E',
      }}
    ></div>
  );
};

export default TotalDominanceChart;

import * as d3 from 'd3';

import { NumberValue } from 'd3';
import { formatXAxisTick } from './chartHelper';

export interface ChartConfig {
  width : number,
  height: number,
  margin: { top: number, right: number, bottom: number, left: number}, // Adjusted top margin for Y-axis labels
  padding: { left: number, right: number, top: number, bottom: number}, // Adjusted padding inside chart area
  gapLeft: number, // Maintain the original gap between y-axis and lines
  gapRight: number,
  leftOffset:number,
  rightOffset: number,
  xScalePadding: number,
  legendOffset: number,
}

// Interface for tooltip configuration
export interface TooltipConfig {
  width: number;
  rowHeight: number;
  baseHeight: number;
  squareSize: number;
  squareOffset: number;
  xOffset: number;
  yOffset: number;
  boundaryPadding: number;
  rightBoundaryOffset: number;
}

// Interface for a data point
export interface DataPoint {
  date: Date;
  value: number;
  formattedValue?: string; // Optional for pre-formatted values
}

interface LegendItem {
  label: string;
  color: string;
}

export function setupChartArea(
  chartRef: React.RefObject<HTMLDivElement | null>,
  chartConfig: ChartConfig
): {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>;
} {
  if (!chartRef.current) throw new Error('Chart reference is null');

  // Clear existing SVG
  d3.select(chartRef.current).select('svg').remove();

  const svg = d3.select(chartRef.current)
    .append('svg')
    .attr('width', chartConfig.width)
    .attr('height', chartConfig.height);

  const chartArea = svg
    .append('g')
    // .attr('clip-path', 'url(#chart-clip)')
    // .attr('transform', `translate(0, 0)`);  // Only margin.left used for offset

  return { svg, chartArea };
}


/**
 * Sets up the x-scale.
 * @param xDomain Current x-domain
 * @param chartConfig Chart configuration
 * @returns xScale
 */
export function setupXScale(
  xDomain: [Date, Date],
  plotLeft: number,
  plotRight: number,
): d3.ScaleTime<number, number> {
  return d3
    .scaleUtc()
    .domain(xDomain)
    .range([plotLeft, plotRight]);
}

/**
 * Sets up the y-scale.
 * @param yDomain Y-axis domain [min, max]
 * @param chartConfig Chart configuration
 * @returns yScale
 */


export function setupYScale(
  yDomain: [number, number],
  chartHeight: number,
  scaleType: 'linear' | 'exponential' | 'log' | 'power' = 'log'
): d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScalePower<number, number>  {
  if (yDomain.length !== 2 || typeof yDomain[0] !== 'number' || typeof yDomain[1] !== 'number') {
    throw new Error('yDomain must be an array of two numbers.');
  }
  if (typeof chartHeight !== 'number' || chartHeight <= 0) {
    throw new Error('chartHeight must be a positive number.');
  }

  let scale;

  switch (scaleType) {
    case 'linear':
      scale = d3.scaleLinear().domain(yDomain).range([chartHeight, 0]);
      break;
    case 'log':
      scale = d3.scaleLog().domain(yDomain).range([chartHeight, 0]);
      break;
    case 'power':
      scale = d3.scalePow().domain(yDomain).range([chartHeight, 0]);
      break;
    default:
      throw new Error('Invalid scale type.');
  }

  return scale;
}



/**
 * Draws the y-axis with customizable tick format.
 * @param svg D3 selection of the SVG
 * @param yScale Y-scale
 * @param chartConfig Chart configuration
 * @param tickFormat Function to format y-ticks
 * @param yTicks Number of ticks (default: 5)
 */
export function drawYAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  yScale: d3.ScaleLinear<number, number>,
  paddingLeft: number,
  paddingBottom: number,
  tickFormat: (domainValue: number | { valueOf(): number }, index: number) => string,
  yTicks: number = 5,
  color: string = '#FFFFFF',
  fontFamily: string = 'Handjet', // Use Handjet font
  fontSize: string = '13.75px'   // Set font size to 13.75px
): void {
  svg.append('g')
    .attr('transform', `translate(${paddingLeft },${paddingBottom - 20})`)
    .call(d3.axisLeft(yScale).ticks(yTicks).tickSizeOuter(0).tickSizeInner(0).tickFormat(tickFormat as any))
    .select('.domain')
    .attr('stroke', '#3E3E3E')
    .selectAll('.tick text')
    .attr('fill', color)
    .attr('x', -20)
    .style('font-family', fontFamily)  // Apply Handjet font
    .style('font-size', fontSize);    // Apply 13.75px font size
}


/**
 * Draws the X-axis with customized tick formatting and styling based on chart type.
 * @param svg D3 selection of the SVG container where the axis will be drawn
 * @param xScale D3 scale for the X-axis (e.g., d3.scaleTime() for time-based scales)
 * @param chartConfig Configuration object containing width, height, and padding properties
 * @param chartType The type of the chart ('Daily', 'Weekly', 'Monthly', 'Yearly')
 */
export function drawXAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number>,
  chartConfig: ChartConfig,
  chartType: string
): void {
  let xAxis;

  // Configure axis based on chart type
  switch (chartType) {
    case 'Daily':
      // Daily chart: show ticks every day with special formatting
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeDay.every(1))
        .tickFormat((domainValue: Date | d3.NumberValue) => {
          const date = domainValue as Date;
          const dayOfWeek = date.getDay();
          const today = new Date();
          // Show 'Today' for current date
          if (date.toDateString() === today.toDateString()) {
            return 'Today';
          }
          // Show month and day for Sundays only
          if (dayOfWeek === 0) {
            const fullMonthName = date.toLocaleString('default', { month: 'short' });
            const day = date.getDate();
            return `${fullMonthName} ${day}`;
          }
          return ''; // Empty string for other days
        });
      break;

    case 'Weekly':
      // Weekly chart: show ticks every week
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeWeek.every(1))
        .tickFormat((domainValue: Date | d3.NumberValue) => {
          const date = domainValue as Date;
          return formatXAxisTick(date, 'Weekly');
        });
      break;

    case 'Monthly':
      // Monthly chart: show ticks every month with short month name and year
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(1))
        .tickFormat((domainValue: Date | d3.NumberValue) => {
          const date = domainValue as Date;
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });
      break;

    case 'Yearly':
      // Yearly chart: show ticks every year with just the year number
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeYear.every(1))
        .tickFormat((domainValue: Date | d3.NumberValue) => {
          const date = domainValue as Date;
          return date.getFullYear().toString();
        });
      break;

    default:
      // Default case: monthly ticks as fallback
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(1))
        .tickFormat((domainValue: Date | d3.NumberValue) => {
          const date = domainValue as Date;
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });
  }

  // Append the X-axis group to the SVG
  svg.append('g')
    .attr('class', 'x-axis')
    // Position the axis at the bottom of the chart, accounting for padding
    .attr('transform', `translate(${chartConfig.padding.left - 120}, ${chartConfig.height - chartConfig.padding.bottom})`)
    .call(xAxis.tickSizeOuter(0)) // Remove outer ticks
    // Style axis lines
    .selectAll('path, line')
    .attr('stroke', '#3E3E3E')
    .attr('stroke-width', 1);

 // Style axis text labels for X-axis
svg.selectAll('.x-axis text')
.style('text-anchor', 'middle')  // Center text horizontally
.style('font-size', '13.75px')   // Set font size to 13.75px (as per your request)
.style('font-family', 'SF Pro Display') // Apply Handjet font
.style('fill', '#FFFFFF')       // Set text color
.attr('transform', 'rotate(0)') // Keep text horizontal (no rotation)
.attr('dx', '0')                // Horizontal offset
.attr('dy', '0.5em');           // Vertical offset below the axis


  // Hide the axis domain line
  svg.select('.x-axis .domain').style('display', 'none');

  // Add a baseline across the chart
  svg.append('line')
    .attr('x1', chartConfig.padding.left)                    // Start at left padding
    .attr('y1', chartConfig.height - chartConfig.padding.bottom) // Position at bottom
    .attr('x2', chartConfig.width - chartConfig.padding.right)   // End at right padding
    .attr('y2', chartConfig.height - chartConfig.padding.bottom) // Same y-position
    .attr('stroke', '#3E3E3E')                              // Line color
    .attr('stroke-width', 1);                               // Line thickness
}

/**
 * Handles tooltip display on mousemove.
 * @param svg D3 selection of the SVG
 * @param chartArea D3 selection of the chart area
 * @param datasets Object mapping dataset names to data points
 * @param xScale X-axis scale
 * @param yScale Y-axis scale
 * @param chartConfig Chart configuration
 * @param tooltipConfig Tooltip configuration
 * @param formatValue Function to format y-values
 */


/**
 * Draws the legend with colored squares and labels.
 * @param svg D3 selection of the SVG
 * @param legendItems Array of legend items
 * @param chartConfig Chart configuration
 * @param tooltipConfig Tooltip configuration
 */
export function drawLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  legendItems: LegendItem[],
  chartConfig: ChartConfig,
  tooltipConfig: TooltipConfig
): void {
  // Remove any existing legend to avoid duplication
  svg.select('.legend').remove();

  const squareSize = tooltipConfig.squareSize;
  const padding = 5; // Space between the square and text
  const spacing = 20; // Space between legend items

  // Append the legend group at a temporary position
  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(0, ${chartConfig.height - chartConfig.padding.bottom + chartConfig.legendOffset + 20})`);

  // Create subgroups for each legend item
  const itemGroups = legend
    .selectAll('.legend-item')
    .data(legendItems)
    .enter()
    .append('g')
    .attr('class', 'legend-item');

  // Append rectangles and texts to each subgroup
  itemGroups.each(function (d) {
    const group = d3.select(this);
    group
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', d.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    group
      .append('text')
      .attr('x', squareSize + padding)
      .attr('y', squareSize / 2) // Center text vertically with the square
      .attr('fill', '#FFFFFF')
      .attr('font-size', '16px')
      .attr('font-family', 'SF Pro Display')
      .attr('dominant-baseline', 'middle') // Ensures vertical centering
      .text(d.label);
  });

  // Calculate the width of each item
  const itemWidths = itemGroups.nodes().map((node) => {
    const text = d3.select(node).select('text');
    const textWidth = (text.node() as SVGTextElement)?.getComputedTextLength();
    return squareSize + padding + textWidth;
  });

  // Position each subgroup dynamically
  let currentX = 0;
  itemGroups.each(function (d, i) {
    const group = d3.select(this);
    group.attr('transform', `translate(${currentX}, 0)`);
    currentX += itemWidths[i] + spacing;
  });

  // Calculate total width (excluding the last spacing)
  const totalWidth = currentX - spacing;

  // Center the legend horizontally
  const legendX = (chartConfig.width - totalWidth) / 2;
  legend.attr(
    'transform',
    `translate(${legendX}, ${chartConfig.height - chartConfig.padding.bottom + chartConfig.legendOffset + 20})`
  );
}


export function drawBars(
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  dataset: DataPoint[],
  color: string,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  barWidth: number,
  section: 'left' | 'right',
  paddingLeft: number = 0, // Horizontal offset
  paddingBottom: number = 0 // Vertical offset
): void {
  if (dataset.length === 0) return;

  // Apply the transform to the chartArea (with horizontal and vertical padding)
  chartArea
    .attr('transform', `translate(${-paddingLeft -10}, ${paddingBottom - 20 })`); // Apply both horizontal and vertical translation

  // Main bars with shadow and color
  chartArea
    .selectAll(`.bar-${section}`)
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', `bar bar-${section}`)
    .attr('x', (d) => {
      const xPos = xScale(d.date);
      return section === 'left' ? xPos - barWidth / 4 : xPos + barWidth / 4;
    })
    .attr('y', (d) => yScale(d.value))
    .attr('width', barWidth / 2)
    .attr('height', (d) => yScale(0) - yScale(d.value))
    .attr('fill', color)
    .attr('stroke', 'none')
    .style(
      'filter',
      'drop-shadow(0px 2px 2px rgb(0, 0, 0)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.81)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.62))'
    );
}






export function handleBarTooltip(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  datasets: { [key: string]: DataPoint[] },
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartConfig: ChartConfig,
  tooltipConfig: TooltipConfig,
  formatValue: (value: number, name: string) => string,
  colors: { [key: string]: string },
  chartType: string
): void {
  let tooltipVisible = false; // Track tooltip visibility
  const chartWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  const chartHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  // Define plot margins to decrease the range on both sides
  const plotLeft = chartConfig.margin.left + 120; // Adjust the margin as needed
  const plotRight = chartWidth - chartConfig.margin.right -80; // Adjust the margin as needed

  svg.on('mousemove', (event) => {
    // Get mouse position relative to the SVG
    const [mouseX] = d3.pointer(event, svg.node());

    // Adjust mouse position relative to chart area
    const transform = chartArea.attr('transform');
    let offsetX = 0;
    if (transform) {
      const match = transform.match(/translate\(([^,]+),/);
      if (match) offsetX = parseFloat(match[1]);
    }
    const adjustedMouseX = mouseX - offsetX;

    // Define bounds with the adjusted plot margins
    const isWithinBounds = adjustedMouseX >= plotLeft && adjustedMouseX <= plotRight;

    // If outside bounds and no tooltip yet, do nothing
    if (!isWithinBounds && !tooltipVisible) {
      return;
    }

    // Only update tooltip and highlights if within bounds
    if (isWithinBounds) {
      // Remove existing tooltip elements before adding new ones
      chartArea.selectAll('.tooltip-box, .tooltip-text, .ecosystem-square').remove();

      // Clamp mouse X position within the adjusted bounds
      const clampedMouseX = Math.max(plotLeft, Math.min(adjustedMouseX, plotRight));
      const mouseDate = xScale.invert(clampedMouseX);

      // Find closest data points for each dataset
      const yValues = Object.keys(datasets).map((name) => {
        const dataset = datasets[name];
        const closest = dataset.reduce((a, b) =>
          Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b
        );
        return { name, value: formatValue(closest.value, name), date: closest.date };
      });

      // Highlight all bars at the closest date
      const closestDate = yValues[0].date; // Use the date from the first dataset (assuming all align)
      chartArea.selectAll('.bar-left, .bar-right').each(function (d) {
        const dataPoint = d as DataPoint;
        if (dataPoint.date.getTime() === closestDate.getTime()) {
          d3.select(this).attr('stroke', 'white').attr('stroke-width', 2);
        } else {
          d3.select(this).attr('stroke', 'none');
        }
      });

      // Calculate tooltip dimensions and position
      const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
      let tooltipX = clampedMouseX + tooltipConfig.xOffset;
      let tooltipY = tooltipConfig.yOffset;

      // Adjust tooltip position to stay within chart bounds
      if (tooltipX + tooltipConfig.width > chartWidth) {
        tooltipX = clampedMouseX - tooltipConfig.width - tooltipConfig.boundaryPadding;
      }
      if (tooltipY + tooltipHeight > chartHeight) {
        tooltipY = chartHeight - tooltipHeight - tooltipConfig.boundaryPadding;
      }
      if (tooltipX < 0) tooltipX = tooltipConfig.boundaryPadding;
      if (tooltipY < 0) tooltipY = tooltipConfig.boundaryPadding;

      // Append tooltip background
      chartArea
        .append('rect')
        .attr('class', 'tooltip-box')
        .attr('x', tooltipX)
        .attr('y', tooltipY)
        .attr('width', tooltipConfig.width)
        .attr('height', tooltipHeight)
        .attr('fill', '#1E1E1E')
        .style('filter', 'drop-shadow(0px 4px 8px rgb(0, 0, 0))');

      // Add formatted date text
      const formattedDate = formatXAxisTick(mouseDate, chartType);
      chartArea
        .append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 10)
        .attr('y', tooltipY + 20)
        .attr('fill', '#E5C46B')
        .attr('font-size', '13.75px')
        .attr('font-family', 'SF Pro Display') 
        .text(formattedDate);

      // Add dataset names and values with colored squares
      yValues.forEach((data, i) => {
        const color = colors[data.name] || 'gray';
        const yPosition = tooltipY + 40 + i * tooltipConfig.rowHeight;

        chartArea
          .append('rect')
          .attr('class', 'ecosystem-square')
          .attr('x', tooltipX + 10)
          .attr('y', yPosition - 5)
          .attr('width', tooltipConfig.squareSize)
          .attr('height', tooltipConfig.squareSize)
          .attr('fill', color)
          .attr('stroke', 'white')
          .attr('stroke-width', 1);

        chartArea
          .append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + 30)
          .attr('y', yPosition)
          .attr('fill', 'white')
          .attr('font-size', '13.75px')
          .attr('font-family', 'SF Pro Display') 
          .attr('dominant-baseline', 'middle')
          .text(data.name);

        chartArea
          .append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + (tooltipConfig.width * (5/6)))
          .attr('y', yPosition)
          .attr('fill', color)
          .attr('font-size', '13.75px')
          .attr('font-family', 'Handjet') 
          .attr('dominant-baseline', 'middle')
          .text(data.value);
      });

      tooltipVisible = true; // Mark tooltip as visible
    }
    // If outside bounds, tooltip and highlights persist in their last state
  });
}




/**
 * Handles wheel events for zooming the chart and returns the new x-domain.
 * @param event WheelEvent
 * @param xDomain Current x-domain [start, end]
 * @param setXDomain Function to set the new x-domain
 * @param fetchDataForRange Function to fetch data for the new range
 * @param minDate Minimum allowed date
 * @param maxDate Maximum allowed date
 * @param zoomStep Step size for zooming (default: 1 month)
 * @returns New x-domain [start, end]
 */
export function handleWheel(
  event: WheelEvent,
  xDomain: [Date, Date],
  setXDomain: (domain: [Date, Date]) => void,
  fetchDataForRange: (start: Date, end: Date) => void,
  minDate: Date,
  maxDate: Date,
  zoomStep: number = 1
): [Date, Date] {  // Changed return type from void to [Date, Date]
  event.preventDefault();
  const delta = event.deltaY;
  
  // Zoom in or out based on the scroll direction
  const zoomDelta = delta > 0 ? zoomStep : -zoomStep;
  const [start, end] = xDomain;
  const newStart = new Date(start);
  const newEnd = new Date(end);

  newStart.setMonth(newStart.getMonth() + zoomDelta);
  newEnd.setMonth(newEnd.getMonth() + zoomDelta);

  if (newStart >= minDate && newEnd <= maxDate) {
    setXDomain([newStart, newEnd]);
    fetchDataForRange(newStart, newEnd);
  }

  return [newStart, newEnd];  // Return the new domain
}
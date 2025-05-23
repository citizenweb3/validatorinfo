import * as d3 from 'd3';
import { formatXAxisTick, formatNumber } from './chartHelper';

export interface ChartConfig {
  width: number,
  height: number,
  margin: { top: number, right: number, bottom: number, left: number }, // Adjusted top margin for Y-axis labels
  padding: { left: number, right: number, top: number, bottom: number }, // Adjusted padding inside chart area
  gapLeft: number, // Maintain the original gap between y-axis and lines
  gapRight: number,
  leftOffset: number,
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
  plotArea: d3.Selection<SVGGElement, unknown, null, undefined>;
} {
  if (!chartRef.current) throw new Error('Chart reference is null');

  // Clear existing SVG
  d3.select(chartRef.current).select('svg').remove();

  const svg = d3.select(chartRef.current)
    .append('svg')
    .attr('width', chartConfig.width)
    .attr('height', chartConfig.height);

  const plotArea = svg
    .append('g')
    .attr('transform', `translate(${chartConfig.padding.left}, ${chartConfig.padding.top})`);

  return { svg, plotArea };
}


/**
 * Sets up the x-scale.
 * @param xDomain Current x-domain
 * @param chartConfig Chart configuration
 * @returns xScale
 */
export function setupXScale(
  xDomain: [Date, Date],
  plotWidth: number
): d3.ScaleTime<number, number> {
  return d3.scaleUtc()
    .domain(xDomain)
    .range([0, plotWidth]);
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
  scaleType: 'linear' | 'exponential' | 'log' | 'power' = 'linear'
): d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScalePower<number, number> {
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
  options?: {
    tickFormat?: (domainValue: number | { valueOf(): number }, index: number) => string,
    yTicks?: number,
    color?: string,
    fontFamily?: string,
    fontSize?: string,
    usePercentage?: boolean,
    labelOffset?: number
  }
): void {
  const {
    yTicks = 5,
    color = '#FFFFFF',
    fontFamily = 'handjet',
    fontSize = '13.75px',
    usePercentage = false,
    labelOffset = -80
  } = options || {};

  const format = (d: any, i: number) => {
    const value = typeof d === 'object' && typeof d.valueOf === 'function' ? d.valueOf() : d;
    return usePercentage ? `${value}%` : formatNumber(value);
  };

  const yAxis = d3.axisLeft(yScale)
    .ticks(yTicks)
    .tickSizeOuter(0)
    .tickSizeInner(0)
    .tickFormat(format as any);

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${paddingLeft},${paddingBottom - 20})`)
    .call(yAxis)
    .select('.domain')
    .attr('stroke', '#3E3E3E');

  svg.selectAll('.y-axis .tick text')
    .attr('fill', color)
    .attr('x', labelOffset)
    .attr('class', `tooltip-text font-handjet`)
    .style('font-size', fontSize);
}





/**
 * Draws the X-axis with customized tick formatting and styling based on chart type.
 * @param svg D3 selection of the SVG container
 * @param xScale D3 scale for the X-axis (e.g., d3.scaleTime() for time-based scales)
 * @param chartWidth The total width of the chart
 * @param chartHeight The total height of the chart
 * @param padding Padding for the chart (top, right, bottom, left)
 * @param chartType The type of the chart ('Daily', 'Weekly', 'Monthly', 'Yearly')
 */
export function drawXAxis(
  plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number>,
  plotHeight: number,
  chartConfig: ChartConfig,
  chartType: string
): void {
  let xAxis;
  switch (chartType) {
    case 'Daily':
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeDay.every(1))
        .tickFormat((d: Date | d3.NumberValue) => {
          const date = d as Date;
          const today = new Date();
          if (date.toDateString() === today.toDateString()) {
            return 'Today';
          }
          if (date.getDay() === 0) {
            const month = date.toLocaleString('default', { month: 'short' });
            return `${month} ${date.getDate()}`;
          }
          return '';
        });
      break;
    case 'Weekly':
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeWeek.every(1))
        .tickFormat((d: Date | d3.NumberValue) => {
          const date = d as Date;
          return formatXAxisTick(date, 'Weekly');
        });
      break;
    case 'Monthly':
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(1))
        .tickFormat((d: Date | d3.NumberValue) => {
          const date = d as Date;
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });
      break;
    case 'Yearly':
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeYear.every(1))
        .tickFormat((d: Date | d3.NumberValue) => {
          const date = d as Date;
          return date.getFullYear().toString();
        });
      break;
    default:
      xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(1))
        .tickFormat((d: Date | d3.NumberValue) => {
          const date = d as Date;
          return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });
  }


  const yAxisOffset = plotHeight + 80;
  let xAxisOffset = 0;

  switch (chartType) {
    case 'Daily':
      xAxisOffset = -20;
      break;
    case 'Monthly':
    case 'Yearly':
      xAxisOffset = -40;
      break;
    case 'Weekly':
    default:
      xAxisOffset = 0;
  }

  const transform = `translate(${-xAxisOffset}, ${yAxisOffset})`;
  // Append the axis group and translate it to the bottom of the plot area.
  plotArea.append('g')
    .attr('class', 'x-axis')
    .attr('transform', transform)
    .call(xAxis.tickSizeOuter(0))
    .selectAll('path, line')
    .attr('stroke', '#3E3E3E')
    .attr('stroke-width', 1);

  // Style tick text
  plotArea.selectAll('.x-axis text')
    .style('text-anchor', 'middle')
    .style('font-size', '13.75px')   // Set font size to 13.75px (as per your request)
    .style('font-family', 'SF Pro Display, Arial, sans-serif')
    .style('fill', '#FFFFFF')
    .attr('dy', '0.5em');

  // Optionally remove the domain path if desired
  plotArea.select('.x-axis .domain').style('display', 'none');

  // Draw a baseline for the x-axis across the full plot width.
  plotArea.append('line')
    .attr('x1', 0)
    .attr('y1', plotHeight + 80)
    .attr('x2', chartConfig.width - chartConfig.padding.left - chartConfig.padding.right)
    .attr('y2', plotHeight + 80)
    .attr('stroke', '#3E3E3E')
    .attr('stroke-width', 1);
}








export function drawLine(
  plotArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  dataset: DataPoint[],
  chartType: string,
  color: string,
  lineGenerator: d3.Line<DataPoint>
): void {
  const yAxisOffset = -20;
  let xAxisOffset = 0;

  switch (chartType) {
    case 'Daily':
      xAxisOffset = -20;
      break;
    case 'Monthly':
    case 'Yearly':
      xAxisOffset = 0;
      break;
    case 'Weekly':
    default:
      xAxisOffset = 0;
  }

  if (dataset.length === 0) return;

  const fullLine = lineGenerator(dataset);
  if (!fullLine) {
    console.error('Failed to generate line path.');
    return;
  }

  // Define SVG filters for shadows
  const svgNode = plotArea.node()?.ownerSVGElement;
  if (!svgNode) {
    console.error('No parent SVG element found.');
    return;
  }
  const svg = d3.select<SVGSVGElement, unknown>(svgNode);
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');

  // Filter for dark shadow (4px blur)
  defs.append('filter')
    .attr('id', 'dark-shadow-blur')
    .append('feGaussianBlur')
    .attr('stdDeviation', 4); // 4px blur radius

  // Filter for less dark shadow (6px blur)
  defs.append('filter')
    .attr('id', 'less-dark-shadow-blur')
    .append('feGaussianBlur')
    .attr('stdDeviation', 6); // 6px blur radius

  const transform = `translate(${-xAxisOffset}, ${yAxisOffset})`;
  const darkShadowTransform = `translate(${-xAxisOffset}, ${yAxisOffset + 4})`; // 4px offset
  const lessDarkShadowTransform = `translate(${-xAxisOffset}, ${yAxisOffset + 6})`; // 6px offset

  // Existing shadow (blurred, thicker path behind)
  plotArea.append('path')
    .attr('transform', transform)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(0, 0, 0, 0.4)')
    .attr('stroke-width', 4)
    .attr('stroke-linecap', 'round')
    .style('filter', 'blur(2px)')
    .attr('d', fullLine)
    .attr('clip-path', 'url(#clip)');

  // Dark shadow line (mimics box-shadow: 0px 4px 4px 0px #000000)
  plotArea.append('path')
    .attr('transform', darkShadowTransform)
    .attr('fill', 'none')
    .attr('stroke', '#000000')
    .attr('stroke-width', 3)
    .attr('stroke-linecap', 'round')
    .style('filter', 'url(#dark-shadow-blur)')
    .attr('d', fullLine)
    .attr('clip-path', 'url(#clip)');

  // Less dark shadow line (mimics box-shadow: 0px 6px 6px 0px #00000040)
  plotArea.append('path')
    .attr('transform', lessDarkShadowTransform)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(0, 0, 0, 0.25)')
    .attr('stroke-width', 2)
    .attr('stroke-linecap', 'round')
    .style('filter', 'url(#less-dark-shadow-blur)')
    .attr('d', fullLine)
    .attr('clip-path', 'url(#clip)');

  // Actual colored line on top
  plotArea.append('path')
    .attr('transform', transform)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('d', fullLine)
    .attr('clip-path', 'url(#clip)');
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
      .attr('class', 'tooltip-text font-sfpro')
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



export function handleTooltip(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  datasets: { [key: string]: DataPoint[] },
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartConfig: ChartConfig,
  tooltipConfig: TooltipConfig,
  formatValue: (value: number, name: string) => string,
  colors: { [key: string]: string },
  plotLeft: number,
  plotRight: number,
  chartWidth: number,
  chartHeight: number,
  chartType: string,
  usePercentage: boolean // <-- New parameter added
): void {
  let lastClampedMouseX: number | null = null;

  let xAxisOffSetValue = 0;
  switch (chartType) {
    case 'Monthly':
    case 'Yearly':
      xAxisOffSetValue = 60;
      break;
    default:
      xAxisOffSetValue = 0;
  }

  svg.on('mousemove', (event) => {
    const [mouseX] = d3.pointer(event, svg.node());
    const transform = chartArea.attr('transform');
    let offsetX = 0;
    if (transform) {
      const match = transform.match(/translate\(([^,]+),/);
      if (match) offsetX = parseFloat(match[1]);
    }
    const adjustedMouseX = mouseX - offsetX;

    let minX = Infinity;
    let maxX = -Infinity;
    Object.values(datasets).forEach((dataset) => {
      if (dataset.length > 0) {
        const datasetMinX = xScale(d3.min(dataset, d => d.date)!);
        const datasetMaxX = xScale(d3.max(dataset, d => d.date)!);
        minX = Math.min(minX, datasetMinX);
        maxX = Math.max(maxX, datasetMaxX);
      }
    });

    const isWithinBounds = adjustedMouseX >= minX && adjustedMouseX <= maxX;
    const mouseXToUse = isWithinBounds ? adjustedMouseX : lastClampedMouseX;
    if (mouseXToUse === null) return;
    const clampedMouseX = Math.max(minX, Math.min(mouseXToUse, maxX));
    if (isWithinBounds) lastClampedMouseX = clampedMouseX;

    const mouseDate = xScale.invert(clampedMouseX);

    const yValues = Object.keys(datasets).map((name, index) => {
      const dataset = datasets[name];
      const closest = dataset.reduce((a, b) =>
        Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b
      );
      return {
        name,
        value: closest.value,
        formattedValue: formatValue(closest.value, name),
        y: yScale(closest.value),
        index
      };
    });

    let dottedLine = chartArea.select<SVGLineElement>('.dotted-line');
    if (dottedLine.empty()) {
      dottedLine = chartArea.append('line')
        .attr('class', 'dotted-line')
        .attr('stroke', '#E5C46B')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2, 2');
    }
    dottedLine
      .attr('x1', clampedMouseX - xAxisOffSetValue)
      .attr('y1', chartHeight + 80)
      .attr('x2', clampedMouseX - xAxisOffSetValue)
      .attr('y2', -20);

    const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
    let tooltipX = (clampedMouseX - xAxisOffSetValue) + tooltipConfig.xOffset;
    let tooltipY = chartConfig.padding.top + tooltipConfig.yOffset;

    if (tooltipX + tooltipConfig.width > chartWidth - tooltipConfig.boundaryPadding - 60) {
      tooltipX = (clampedMouseX - xAxisOffSetValue) - tooltipConfig.width - tooltipConfig.boundaryPadding;
    }
    if (tooltipY + tooltipHeight > chartHeight - chartConfig.padding.bottom) {
      tooltipY = chartHeight - chartConfig.padding.bottom - tooltipHeight - tooltipConfig.boundaryPadding;
    }

    let tooltipBox = chartArea.select<SVGRectElement>('.tooltip-box');
    if (tooltipBox.empty()) {
      tooltipBox = chartArea.append('rect')
        .attr('class', 'tooltip-box')
        .attr('fill', '#1E1E1E')
        .style('filter', 'drop-shadow(0px 4px 8px rgb(0, 0, 0))');
    }
    tooltipBox
      .attr('x', tooltipX)
      .attr('y', tooltipY)
      .attr('width', tooltipConfig.width)
      .attr('height', tooltipHeight);

    chartArea.selectAll('.tooltip-text').remove();
    const formattedDate = formatXAxisTick(mouseDate, chartType);
    chartArea.append('text')
      .attr('class', 'tooltip-text')
      .attr('x', tooltipX + tooltipConfig.xOffset)
      .attr('y', tooltipY + 20)
      .attr('fill', '#E5C46B')
      .attr('font-size', '13.75px')
      .attr('class', 'tooltip-text font-handjet')
      .text(formattedDate);

    yValues.forEach((data, i) => {
      const color = colors[data.name] || 'gray';
      const yPosition = tooltipY + 40 + i * tooltipConfig.rowHeight;

      chartArea.append('rect')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 10)
        .attr('y', yPosition - 10)
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
        .attr('font-size', '13.75px')
        .attr('class', 'tooltip-text font-sfpro')
        .text(data.name);

      // 🔥 Use percentage or formatNumber
      const formattedValue = usePercentage
        ? `${data.value.toFixed(2)}%`
        : `$${formatNumber(data.value)}`;

      chartArea.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 120)
        .attr('y', yPosition)
        .attr('fill', color)
        .attr('font-size', '13.75px')
        .attr('font-family', 'Handjet')
        .text(formattedValue);

      let intersectionSquare = chartArea.select<SVGRectElement>(`.intersection-square-${data.index}`);
      if (intersectionSquare.empty()) {
        intersectionSquare = chartArea.append('rect')
          .attr('class', `intersection-square intersection-square-${data.index}`)
          .attr('width', tooltipConfig.squareSize)
          .attr('height', tooltipConfig.squareSize)
          .attr('fill', colors[data.name] || 'gray')
          .attr('stroke', 'white')
          .attr('stroke-width', 1);
      }
      intersectionSquare
        .attr('x', clampedMouseX - xAxisOffSetValue - tooltipConfig.squareOffset)
        .attr('y', data.y - tooltipConfig.squareOffset - 20);
    });
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

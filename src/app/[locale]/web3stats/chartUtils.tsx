import * as d3 from 'd3';

// Interface for chart configuration
export interface ChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  leftOffset: number;
  rightOffset: number;
  xScalePadding: number;
  legendOffset: number;
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

// Interface for legend items
interface LegendItem {
  label: string;
  color: string;
}

/**
 * Draws a line on the chart area.
 * @param chartArea D3 selection of the chart area
 * @param dataset Array of data points
 * @param color Line color
 * @param lineGenerator D3 line generator
 * @param trimPixels Optional pixels to trim from the right
 */
export function drawLine(
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  dataset: DataPoint[],
  color: string,
  lineGenerator: d3.Line<DataPoint>,
  trimPixels?: number
): void {
  if (dataset.length === 0) return;

  const fullLine = lineGenerator(dataset);
  if (!fullLine) {
    console.error('Failed to generate line path.');
    return;
  }

  let linePath = fullLine;
  if (trimPixels) {
    const lastPoint = dataset[dataset.length - 1];
    const trimmedX = lineGenerator.x()(lastPoint, dataset.length - 1, dataset) - trimPixels;
    const trimmedY = lineGenerator.y()(lastPoint, dataset.length - 1, dataset);
    linePath = fullLine.replace(/([ML])[^ML]*$/, `$1${trimmedX},${trimmedY}`);
  }

  // Background line for contrast
  chartArea
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('d', linePath)
    .style('filter', 'none');

  // Main colored line with shadow
  chartArea
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
    .attr('d', linePath)
    .style(
      'filter',
      'drop-shadow(0px 2px 2px rgb(0, 0, 0)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.81)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.62))'
    )
    .attr('stroke-linecap', 'round');
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
export function handleTooltip(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  datasets: { [key: string]: DataPoint[] },
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartConfig: ChartConfig,
  tooltipConfig: TooltipConfig,
  formatValue: (value: number, name: string) => string,
  colors: { [key: string]: string }
): void {
  svg.on('mousemove', (event) => {
    chartArea.selectAll('.dotted-line, .tooltip-box, .tooltip-text, .ecosystem-square, .intersection-square').remove();

    const [mouseX] = d3.pointer(event, svg.node());
    const mouseDate = xScale.invert(mouseX);

    const yValues = Object.keys(datasets).map((name) => {
      const dataset = datasets[name];
      const closest = dataset.reduce((a, b) =>
        Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b
      );
      return { name, value: formatValue(closest.value, name) };
    });

    const chartLeft = chartConfig.margin.left;
    const chartRight = chartConfig.width - tooltipConfig.rightBoundaryOffset;
    const transform = chartArea.attr('transform');
    let offsetX = 0;
    if (transform) {
      const match = transform.match(/translate\(([^,]+),/);
      if (match) offsetX = parseFloat(match[1]);
    }
    const adjustedMouseX = mouseX - offsetX;
    const clampedMouseX = Math.max(chartLeft, Math.min(adjustedMouseX, chartRight));

    chartArea
      .append('line')
      .attr('class', 'dotted-line')
      .attr('x1', clampedMouseX)
      .attr('y1', chartConfig.margin.top)
      .attr('x2', clampedMouseX)
      .attr('y2', chartConfig.height - chartConfig.margin.bottom)
      .attr('stroke', '#E5C46B')
      .attr('stroke-dasharray', '2, 2');

    const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
    let tooltipX = clampedMouseX + tooltipConfig.xOffset;
    let tooltipY = chartConfig.margin.top + tooltipConfig.yOffset;

    if (tooltipX + tooltipConfig.width > chartConfig.width - chartConfig.margin.right) {
      tooltipX = clampedMouseX - tooltipConfig.width - tooltipConfig.boundaryPadding;
    }
    if (tooltipY + tooltipHeight > chartConfig.height - chartConfig.margin.bottom) {
      tooltipY = chartConfig.height - chartConfig.margin.bottom - tooltipHeight - tooltipConfig.boundaryPadding;
    }

    chartArea
      .append('rect')
      .attr('class', 'tooltip-box')
      .attr('x', tooltipX)
      .attr('y', tooltipY)
      .attr('width', tooltipConfig.width)
      .attr('height', tooltipHeight)
      .attr('fill', '#1E1E1E')
      .style('filter', 'drop-shadow(0px 4px 8px rgb(0, 0, 0))');

    chartArea
      .append('text')
      .attr('class', 'tooltip-text')
      .attr('x', tooltipX + tooltipConfig.xOffset)
      .attr('y', tooltipY + 20)
      .attr('fill', '#E5C46B')
      .attr('font-size', '10px')
      .text(mouseDate.toISOString().split('T')[0]);

    yValues.forEach((data, i) => {
      const color = colors[data.name] || 'gray';
      const yPosition = tooltipY + 40 + i * tooltipConfig.rowHeight;

      chartArea
        .append('rect')
        .attr('class', 'ecosystem-square')
        .attr('x', tooltipX + tooltipConfig.xOffset)
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
        .attr('font-size', '10px')
        .attr('dominant-baseline', 'middle')
        .text(data.name);

      chartArea
        .append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 120)
        .attr('y', yPosition)
        .attr('fill', color)
        .attr('font-size', '10px')
        .attr('dominant-baseline', 'middle')
        .text(data.value);
    });

    yValues.forEach((data) => {
      const dataset = datasets[data.name];
      if (dataset) {
        const closest = dataset.reduce((a, b) =>
          Math.abs(xScale(a.date) - clampedMouseX) < Math.abs(xScale(b.date) - clampedMouseX) ? a : b
        );
        const intersectionY = yScale(closest.value);

        chartArea
          .append('rect')
          .attr('class', 'intersection-square')
          .attr('x', clampedMouseX - tooltipConfig.squareOffset)
          .attr('y', intersectionY - tooltipConfig.squareOffset)
          .attr('width', tooltipConfig.squareSize)
          .attr('height', tooltipConfig.squareSize)
          .attr('fill', colors[data.name] || 'gray')
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .transition()
          .duration(100)
          .ease(d3.easeLinear);
      }
    });
  });
}

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
  const legend = svg
    .append('g')
    .attr(
      'transform',
      `translate(${chartConfig.width / 2}, ${chartConfig.height - chartConfig.margin.bottom + chartConfig.legendOffset + 20})`
    );

  const totalWidth = legendItems.length * 100;
  const startX = -totalWidth / 2;

  legendItems.forEach((item, index) => {
    const itemX = startX + index * 100;

    legend
      .append('rect')
      .attr('x', itemX)
      .attr('y', 0)
      .attr('width', tooltipConfig.squareSize)
      .attr('height', tooltipConfig.squareSize)
      .attr('fill', item.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    legend
      .append('text')
      .attr('x', itemX + 20)
      .attr('y', tooltipConfig.squareSize)
      .attr('fill', '#FFFFFF')
      .attr('font-size', '10px')
      .text(item.label);
  });
}



/**
 * Handles wheel events for zooming the chart.
 * @param event WheelEvent
 * @param xDomain Current x-domain [start, end]
 * @param setXDomain Function to set the new x-domain
 * @param fetchDataForRange Function to fetch data for the new range
 * @param minDate Minimum allowed date
 * @param maxDate Maximum allowed date
 * @param zoomStep Step size for zooming (default: 1 month)
 */
export function handleWheel(
  event: WheelEvent,
  xDomain: [Date, Date],
  setXDomain: (domain: [Date, Date]) => void,
  fetchDataForRange: (start: Date, end: Date) => void,
  minDate: Date,
  maxDate: Date,
  zoomStep: number = 1
): void {
  event.preventDefault();
  const delta = event.deltaY > 0 ? zoomStep : -zoomStep;
  const [start, end] = xDomain;
  const newStart = new Date(start);
  const newEnd = new Date(end);
  newStart.setMonth(newStart.getMonth() + delta);
  newEnd.setMonth(newEnd.getMonth() + delta);
  if (newStart >= minDate && newEnd <= maxDate) {
    setXDomain([newStart, newEnd]);
    fetchDataForRange(newStart, newEnd);
  }
}



export interface ChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  leftOffset: number;
  rightOffset: number;
  xScalePadding: number;
  legendOffset: number;
}

/**
 * Sets up the SVG, chart area, and clip path.
 * @param chartRef Reference to the chart container
 * @param chartConfig Chart configuration
 * @returns { svg, chartArea }
 */
export function setupChartArea(
  chartRef: React.RefObject<HTMLDivElement>,
  chartConfig: ChartConfig
): {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>;
} {
  if (!chartRef.current) throw new Error('Chart reference is null');
  d3.select(chartRef.current).select('svg').remove();
  const svg = d3.select(chartRef.current)
    .append('svg')
    .attr('width', chartConfig.width)
    .attr('height', chartConfig.height + 20);
  const chartArea = svg
    .append('g')
    .attr('clip-path', 'url(#chart-clip)')
    .attr('transform', `translate(${chartConfig.leftOffset}, 0)`);
  svg.append('defs')
    .append('clipPath')
    .attr('id', 'chart-clip')
    .append('rect')
    .attr('x', chartConfig.margin.left - chartConfig.leftOffset)
    .attr('y', chartConfig.margin.top)
    .attr('width', chartConfig.width - chartConfig.margin.left - chartConfig.margin.right - chartConfig.leftOffset - chartConfig.rightOffset)
    .attr('height', chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom);
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
  chartConfig: ChartConfig
): d3.ScaleTime<number, number> {
  return d3
    .scaleUtc()
    .domain(xDomain)
    .range([chartConfig.margin.left, chartConfig.width - chartConfig.margin.right + chartConfig.xScalePadding]);
}

/**
 * Sets up the y-scale.
 * @param yDomain Y-axis domain [min, max]
 * @param chartConfig Chart configuration
 * @returns yScale
 */
export function setupYScale(
  yDomain: [number, number],
  chartConfig: ChartConfig
): d3.ScaleLinear<number, number> {
  return d3
    .scaleLinear()
    .domain(yDomain)
    .range([chartConfig.height - chartConfig.margin.bottom, chartConfig.margin.top]);
}


/**
 * Draws the x-axis.
 * @param svg D3 selection of the SVG
 * @param xScale X-scale
 * @param chartConfig Chart configuration
 */
export function drawXAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number>,
  chartConfig: ChartConfig
): void {
  svg.append('g')
    .attr('transform', `translate(0,${chartConfig.height - chartConfig.margin.bottom})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0))
    .selectAll('path, line')
    .attr('stroke', '#3E3E3E');
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
  chartConfig: ChartConfig,
  tickFormat: (domainValue: number | { valueOf(): number }, index: number) => string,
  yTicks: number = 5
): void {
  svg.append('g')
    .attr('transform', `translate(${chartConfig.margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(yTicks).tickSizeOuter(0).tickSizeInner(0).tickFormat(tickFormat as any))
    .select('.domain')
    .attr('stroke', '#3E3E3E')
    .selectAll('.tick text')
    .attr('fill', '#FFFFFF')
    .attr('x', -20);
}



export function drawBars(
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  dataset: DataPoint[],
  color: string,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  barWidth: number,
  section: 'left' | 'right'
): void {
  if (dataset.length === 0) return;

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
    .attr('stroke', 'none');
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
  barWidth: number
): void {
  svg.on('mousemove', (event) => {
    chartArea.selectAll('.dotted-line, .intersection-square, .ecosystem-square, .tooltip-text').remove();

    const [mouseX] = d3.pointer(event, svg.node());
    const mouseDate = xScale.invert(mouseX);

    const yValues = Object.keys(datasets).map((name) => {
      const dataset = datasets[name];
      const closest = dataset.reduce((a, b) =>
        Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b
      );
      return { name, value: formatValue(closest.value, name) };
    });

    const chartLeft = chartConfig.margin.left;
    const chartRight = chartConfig.width - tooltipConfig.rightBoundaryOffset;
    const transform = chartArea.attr('transform');
    let offsetX = 0;
    if (transform) {
      const match = transform.match(/translate\(([^,]+),/);
      if (match) offsetX = parseFloat(match[1]);
    }
    const adjustedMouseX = mouseX - offsetX;
    const clampedMouseX = Math.max(chartLeft, Math.min(adjustedMouseX, chartRight));

    // Highlight the closest bars
    yValues.forEach((data) => {
      const dataset = datasets[data.name];
      if (dataset) {
        const closestDataPoint = dataset.reduce((a, b) =>
          Math.abs(xScale(a.date) - clampedMouseX) < Math.abs(xScale(b.date) - clampedMouseX) ? a : b
        );
        chartArea
          .selectAll(`.bar-${data.name === 'Total Crypto Capitalization' ? 'left' : 'right'}`)
          .each(function (d) {
            const dataPoint = d as DataPoint;
            d3.select(this).attr('stroke', dataPoint.date === closestDataPoint.date ? 'white' : 'none');
          })
          .attr('stroke-width', 1);
      }
    });

    chartArea
      .append('line')
      .attr('class', 'dotted-line')
      .attr('x1', clampedMouseX)
      .attr('y1', chartConfig.margin.top)
      .attr('x2', clampedMouseX)
      .attr('y2', chartConfig.height - chartConfig.margin.bottom)
      .attr('stroke', '#E5C46B')
      .attr('stroke-dasharray', '2, 2');

    const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
    let tooltipX = clampedMouseX + tooltipConfig.xOffset;
    let tooltipY = chartConfig.margin.top + tooltipConfig.yOffset;

    if (tooltipX + tooltipConfig.width > chartConfig.width - chartConfig.margin.right) {
      tooltipX = clampedMouseX - tooltipConfig.width - tooltipConfig.boundaryPadding;
    }
    if (tooltipY + tooltipHeight > chartConfig.height - chartConfig.margin.bottom) {
      tooltipY = chartConfig.height - chartConfig.margin.bottom - tooltipHeight - tooltipConfig.boundaryPadding;
    }

    let tooltipBox = chartArea.select<SVGRectElement>('.tooltip-box');
    if (tooltipBox.empty()) {
      tooltipBox = chartArea
        .append('rect')
        .attr('class', 'tooltip-box')
        .attr('x', tooltipX)
        .attr('y', tooltipY)
        .attr('width', tooltipConfig.width)
        .attr('height', tooltipHeight)
        .attr('fill', '#1E1E1E')
        .style('filter', 'drop-shadow(0px 4px 8px rgb(0, 0, 0))');
    } else {
      tooltipBox.attr('x', tooltipX).attr('y', tooltipY).attr('width', tooltipConfig.width).attr('height', tooltipHeight);
    }

    chartArea
      .append('text')
      .attr('class', 'tooltip-text')
      .attr('x', tooltipX + tooltipConfig.xOffset)
      .attr('y', tooltipY + 20)
      .attr('fill', '#E5C46B')
      .attr('font-size', '10px')
      .text(mouseDate.toISOString().split('T')[0]);

    yValues.forEach((data, i) => {
      const color = colors[data.name];
      const yPosition = tooltipY + 40 + i * tooltipConfig.rowHeight;

      chartArea
        .append('rect')
        .attr('class', 'ecosystem-square')
        .attr('x', tooltipX + tooltipConfig.xOffset)
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
        .attr('font-size', '10px')
        .attr('dominant-baseline', 'middle')
        .text(data.name);

      chartArea
        .append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 220)
        .attr('y', yPosition)
        .attr('fill', color)
        .attr('font-size', '10px')
        .attr('dominant-baseline', 'middle')
        .text(data.value);
    });
  });
}
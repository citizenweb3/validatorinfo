import * as d3 from 'd3';
import { formatXAxisTick } from '@/components/chart/chartHelper';

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





function getXOffsetByChartType(
  chartType: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
): number {
  switch (chartType) {
    case 'Daily':
      return -130;
    case 'Weekly':
      return -100;
    case 'Monthly':
      return -160;
    case 'Yearly':
      return -60;
    default:
      return 0;
  }
}

export function drawBars(
  chartArea: d3.Selection<SVGGElement, unknown, null, undefined>,
  dataset: DataPoint[],
  color: string,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  barWidth: number,
  section: 'left' | 'right',
  paddingLeft: number = 0,
  paddingBottom: number = 0,
  chartType: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
): void {
  if (dataset.length === 0) return;

  const xOffset = getXOffsetByChartType(chartType);
  const yOffset = -70;

  const barsGroup = chartArea
    .append('g')
    .attr(
      'transform',
      `translate(${xOffset + paddingLeft}, ${yOffset + paddingBottom})`
    )
    .attr('clip-path', 'url(#clipBar)');

  barsGroup
    .selectAll(`.bar-${section}`)
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', `bar bar-${section}`)
    .attr('x', (d) => {
      const xPos = xScale(d.date);
      return section === 'left'
        ? xPos - barWidth / 4
        : xPos + barWidth / 4;
    })
    .attr('y', (d) => yScale(d.value))
    .attr('width', barWidth / 2)
    .attr('height', (d) => yScale(0) - yScale(d.value))
    .attr('fill', color)
    .attr('stroke', 'none')
    .attr('opacity', 0.7)
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
  const plotRight = chartWidth - chartConfig.margin.right - 80; // Adjust the margin as needed

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
          d3.select(this)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('opacity', 1); 
        } else {
          d3.select(this)
            .attr('stroke', 'none')
            .attr('opacity', 0.7);
        }
      });
      // Calculate tooltip dimensions and position
      const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
      let tooltipX = clampedMouseX + tooltipConfig.xOffset;
      let tooltipY = tooltipConfig.yOffset;

      // Define the threshold for switching direction early (50px before the right edge)
      const flipThreshold = chartWidth - tooltipConfig.width - 50;

      // Adjust tooltip position to stay within chart bounds
      if (tooltipX > flipThreshold) {
        tooltipX = clampedMouseX - tooltipConfig.width - tooltipConfig.boundaryPadding;
      }

      // Ensure tooltip does not overflow the right edge
      if (tooltipX + tooltipConfig.width > chartWidth) {
        tooltipX = chartWidth - tooltipConfig.width - tooltipConfig.boundaryPadding;
      }

      // Ensure tooltip does not overflow the left edge
      if (tooltipX < 0) {
        tooltipX = tooltipConfig.boundaryPadding;
      }

      // Ensure tooltip does not overflow the bottom edge
      if (tooltipY + tooltipHeight > chartHeight) {
        tooltipY = chartHeight - tooltipHeight - tooltipConfig.boundaryPadding;
      }

      // Ensure tooltip does not overflow the top edge
      if (tooltipY < 0) {
        tooltipY = tooltipConfig.boundaryPadding;
      }

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
        .attr('class', 'tooltip-text font-handjet')
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
          .attr('class', 'tooltip-text font-sfpro')
          .attr('dominant-baseline', 'middle')
          .text(data.name);

        chartArea
          .append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + (tooltipConfig.width * (5 / 6)))
          .attr('y', yPosition)
          .attr('fill', color)
          .attr('font-size', '13.75px')
          .attr('class', 'tooltip-text font-handjet')
          .attr('dominant-baseline', 'middle')
          .text(data.value);
      });

      tooltipVisible = true; // Mark tooltip as visible
    }
  });
}




import { ChartConfig, DataPoint, TooltipConfig } from '@/components/chart/chartUtils';
import * as d3 from 'd3';
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
  chartType: string
): void {
  let lastClampedMouseX: number | null = null;

  // Define xAxisOffSetValue based on chartType
  let xAxisOffSetValue = 0;
  switch (chartType) {
    case 'Daily':
    case 'Weekly':
      xAxisOffSetValue = 0;
      break;
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

    // Calculate dataset bounds
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

    // Clamp mouse position
    const isWithinBounds = adjustedMouseX >= minX && adjustedMouseX <= maxX;
    const mouseXToUse = isWithinBounds ? adjustedMouseX : lastClampedMouseX;
    if (mouseXToUse === null) return;
    const clampedMouseX = Math.max(minX, Math.min(mouseXToUse, maxX));
    if (isWithinBounds) lastClampedMouseX = clampedMouseX;

    const mouseDate = xScale.invert(clampedMouseX);

    // Gather tooltip data
    const yValues = Object.keys(datasets).map((name, index) => {
      const dataset = datasets[name];
      const closest = dataset.reduce((a, b) =>
        Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b
      );
      return { name, value: formatValue(closest.value, name), y: yScale(closest.value), index };
    });

    // Manage the dotted line
    let dottedLine = chartArea.select<SVGLineElement>('.dotted-line');
    if (dottedLine.empty()) {
      dottedLine = chartArea.append('line')
        .attr('class', 'dotted-line')
        .attr('stroke', '#E5C46B')
        .attr('stroke-width', 1) // Stroke width set to 1
        .attr('stroke-dasharray', '2, 2');
    }
    dottedLine
      .attr('x1', clampedMouseX - xAxisOffSetValue)
      .attr('y1', chartHeight + 80)
      .attr('x2', clampedMouseX - xAxisOffSetValue)
      .attr('y2', -20);

    // Position the tooltip
    const tooltipHeight = tooltipConfig.baseHeight + yValues.length * tooltipConfig.rowHeight;
    let tooltipX = (clampedMouseX - xAxisOffSetValue) + tooltipConfig.xOffset;
    let tooltipY = chartConfig.padding.top + tooltipConfig.yOffset;

    if (tooltipX + tooltipConfig.width > chartWidth - tooltipConfig.boundaryPadding - 60) {
      tooltipX = (clampedMouseX - xAxisOffSetValue) - tooltipConfig.width - tooltipConfig.boundaryPadding;
    }
    if (tooltipY + tooltipHeight > chartHeight - chartConfig.padding.bottom) {
      tooltipY = chartHeight - chartConfig.padding.bottom - tooltipHeight - tooltipConfig.boundaryPadding;
    }

    // Manage the tooltip box persistently
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

    // Update tooltip content
    chartArea.selectAll('.tooltip-text').remove();
    const formattedDate = formatXAxisTick(mouseDate, chartType);
    chartArea.append('text')
      .attr('class', 'tooltip-text')
      .attr('x', tooltipX + tooltipConfig.xOffset)
      .attr('y', tooltipY + 20)
      .attr('fill', '#E5C46B')
      .attr('font-size', '13.75px')
      .attr('font-family', 'SF Pro Display')
      .text(formattedDate);

    yValues.forEach((data, i) => {
      console.log("inside tooltip",data);
      const color = colors[data.name] || 'gray';
      const yPosition = tooltipY + 40 + i * tooltipConfig.rowHeight;

      chartArea
          .append('rect')
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
        .attr('font-family', 'SF Pro Display')
        .text(data.name);

      chartArea.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 120)
        .attr('y', yPosition)
        .attr('fill', color)
        .attr('font-size', '13.75px')
        .attr('font-family', 'Handjet')
        .text(`$${parseFloat(data.value.replace('$', '')).toFixed(2)}`);


      // Manage the intersection square with smooth transition
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
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .attr('x', clampedMouseX - xAxisOffSetValue - tooltipConfig.squareOffset)
        .attr('y', data.y - tooltipConfig.squareOffset - 20);
    });
  });

  // Clean up on mouse leave
  // svg.on('mouseleave', () => {
  //   chartArea.selectAll('.dotted-line, .tooltip-box, .tooltip-text, .ecosystem-square').remove();
  //   lastClampedMouseX = null;
  // });
}


const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  import { timeFormat } from 'd3-time-format';
  
  const isoWeekFormat = timeFormat('%V'); // ISO week number (01-53)
  const yearFormat = timeFormat('%G');    // ISO week-numbering year
  
  export const formatXAxisTick = (date: Date, chartType: string): string => {
    switch (chartType) {
      case 'Weekly':
        return `Week ${isoWeekFormat(date)}`;
  
      case 'Monthly':
        return `${monthShortNames[date.getMonth()]} ${date.getFullYear()}`;
  
      case 'Yearly':
        return `${date.getFullYear()}`;
  
      case 'Daily':
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  
      default:
        return date.toLocaleDateString();
    }
  };
  
  
  
  export function formatNumber(num: any, precision: number = 1): string {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(precision) + 'T'; // Trillions (T)
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(precision) + 'B'; // Billions (B)
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(precision) + 'M'; // Millions (M)
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(precision) + 'K'; // Thousands (K)
    } else {
      return num.toString(); // Less than 1000
    }
  }
  
  
  
  
  export function drawDropShadow(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    // Define the drop shadow filter
    const defs = svg.append('defs');
    defs
      .append('filter')
      .attr('id', 'shadow')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 1)
      .attr('stdDeviation', 1)
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.5);
  }
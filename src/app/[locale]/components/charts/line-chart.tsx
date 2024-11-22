import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface DataPoint {
  x: number;
  y: number;
}

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  className: string;
  shadowColor?: string;
  startColor?: string; // Start color for gradient
  endColor?: string; // End color for gradient
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  className,
  shadowColor = 'rgba(0, 0, 0, 0.3)',
  startColor = 'darkgreen', // Start color for gradient (left side)
  endColor = 'lightgreen', // End color for gradient (right side)
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up the SVG element
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    // Set up scales based on data
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.y)! - 10, d3.max(data, (d) => d.y)! + 10]) // Add padding for shadow effect
      .range([height, 0]);

    // Define the line generator with no curve (jagged line)
    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveLinear); // Straight line segments between points

    // Define the area generator for shadow effect
    const shadowAreaGenerator = d3
      .area<DataPoint>()
      .x((d) => xScale(d.x))
      .y0(height) // Baseline for the area shadow
      .y1((d) => yScale(d.y))
      .curve(d3.curveLinear); // Match the line style (jagged)

    // Draw the shadow area (background gradient)
    svg
      .append('path')
      .datum(data)
      .attr('d', shadowAreaGenerator)
      .attr('fill', `url(#shadowGradient)`)
      .attr('opacity', 0.5);

    const defs = svg.append('defs');

    // Define a gradient for the line stroke
    const lineGradient = defs
      .append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%') // Horizontal gradient from left to right
      .attr('y2', '0%');

    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', startColor); // Dark green at the start

    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', endColor); // Light green at the end

    // Draw the main line with gradient stroke
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#lineGradient)') // Use the gradient as the stroke color
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);
  }, [data, width, height, shadowColor, startColor, endColor]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{
        filter: 'drop-shadow(0 0.525rem 0.25rem #000)',
      }}
      ref={svgRef}
    ></svg>
  );
};

export default LineChart;

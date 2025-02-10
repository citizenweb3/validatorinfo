'use client';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { generateDataForDays } from './data'; // Ensure this function generates data correctly
import { FC } from 'react';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import centralized ecosystem config

interface ChartWidgetProps {
  chartType: string;
  ecosystems: string[];
}

interface DataPoint {
  date: Date;
  value: number;
}

const ChartWidget: FC<ChartWidgetProps> = ({ chartType, ecosystems }) => {
  const [datasets, setDatasets] = useState<{ [key: string]: DataPoint[] }>({});
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: string, y: {
      name: string;
      value: string;
    }[]
  }>({ x: '', y: [] });

  const width = 1150;
  const height = 200;
  const marginTop = 15;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 105;

  // // Default start date is set to Jan 1, 2021
  const minDate = new Date('2021-01-01');
  const [xDomain, setXDomain] = useState<[Date, Date]>([minDate, new Date()]); // Set end date to current date


  // Set up x-axis scale, mapping date range to horizontal space
  const xScale = d3.scaleUtc()
    .domain(xDomain) // input date range
    .range([marginLeft, width - marginRight]); // output horizontal range

  // Set up y-axis scale, mapping value range to vertical space
  const yScale = d3.scaleLinear()
    .domain([0, 100]) // input value range
    .range([height - marginBottom, marginTop]); // output vertical range

  /**
   * Handle mouse wheel event to zoom in/out the chart.
   * @param event - WheelEvent
   */
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;

    const [start, end] = xDomain;
    const newStart = new Date(start);
    const newEnd = new Date(end);

    // Update the start and end dates based on the wheel scroll delta (forward or backward)
    newStart.setMonth(newStart.getMonth() + delta);
    newEnd.setMonth(newEnd.getMonth() + delta);

    // Check if the new date range exceeds the minDate or maxDate
    if (newStart >= minDate && newEnd <= new Date()) {
      setXDomain([newStart, newEnd]); // Only update if within bounds
    }
  };

  // Draw the chart function
  const drawChart = () => {
    // Check if the chart reference is valid
    if (!chartRef.current) return;

    // Remove any existing SVG element before redrawing
    d3.select(chartRef.current).select("svg").remove();

    // Create a new SVG element and set its dimensions and viewBox
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Define the chart area with a clipping path to restrict drawing within the chart boundaries
    const chartArea = svg.append("g")
      .attr("clip-path", "url(#chart-clip)");

    // Append the clip-path definition to the SVG
    svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("x", marginLeft + 20)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - 30 - marginRight)
      .attr("height", height - marginTop - marginBottom);

    // Set the domain of the x-scale based on the provided data
    xScale.domain(xDomain);

    // Draw the x-axis at the bottom of the chart
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("path, line")
      .attr("stroke", "#3E3E3E");

    // Draw the y-axis on the left side of the chart
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll("path, line, .tick line")
      .attr("stroke", "#3E3E3E")
      .style("stroke-dasharray", "none");

    // Line generator for plotting data points
    const lineGenerator = d3.line()
  .x((d: any) => xScale(d.date))
  .y((d: any) => yScale(d.value));

    // Function to render a line for each ecosystem
    const renderLine = (dataset: any, ecosystem: string) => {
      if (!dataset || dataset.length === 0) {
        console.warn(`No data available for ecosystem: ${ecosystem}`);
        return;
      }

      const color = (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color || 'gray';

      // Define the left and right limits for the visible range of the chart
      const leftLimit = width * 0.1;  // 10% of the chart width
      const rightLimit = width * 0.9; // 90% of the chart width

      // Adjust the domain of xScale to only include the portion of data within the visible range
      const visibleDomain = [xScale.invert(leftLimit), xScale.invert(rightLimit)];
      xScale.domain(visibleDomain);

      // Render the path with a black border
      chartArea.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("d", lineGenerator)
        .style("filter", "none");

      // Render the colored line with three bottom-side shadows
      chartArea.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator)
        .style("filter", "drop-shadow(0px 4px 4px rgba(0, 0, 0, 1)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 6px 6px rgba(0, 0, 0, 0.25))")
        .attr("stroke-linecap", "round");
    };

    // Render the lines for all ecosystems
    ecosystems.forEach((ecosystem) => {
      const dataset = datasets[ecosystem];
      if (dataset) renderLine(dataset, ecosystem);
    });

    // Handle mouse movement for the tooltip and intersections
    svg.on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event);
      const mouseDate = xScale.invert(mouseX);

      // Get the y-values (data) for all ecosystems at the mouse's x-position
      const yValues = ecosystems.map(ecosystem => {
        const dataset = datasets[ecosystem];
        if (!dataset) return { name: ecosystem, value: 'N/A' };

        const closest = dataset.reduce((a, b) =>
          Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - a.date.getTime()) ? a : b
        );

        return { name: ecosystem, value: `${closest.value.toFixed(2)}%` };
      });

      // Set the tooltip data (date and y-values for ecosystems)
      setTooltip({
        x: mouseDate.toISOString().split("T")[0],
        y: yValues,
      });

      // Remove old elements before creating new ones
      chartArea.selectAll(".dotted-line, .tooltip-box, .tooltip-text, .ecosystem-square, .intersection-square").remove();
      let leftLimit = width * 0.115;

      // Draw a dotted vertical line at the mouse position for better visualization
      chartArea.append("line")
        .attr("class", "dotted-line")
        .attr("x1", Math.max(leftLimit, Math.min(mouseX, width - marginRight - 20)))
        .attr("y1", marginTop)
        .attr("x2", Math.max(leftLimit, Math.min(mouseX, width - marginRight - 20)))
        .attr("y2", height - marginBottom)
        .attr("stroke", "#E5C46B")
        .attr("stroke-dasharray", "2, 2");

      // Calculate dynamic size of the tooltip
      const tooltipWidth = 180;
      const rowHeight = 22;
      const tooltipHeight = 30 + yValues.length * rowHeight;

      // Calculate the X and Y positions for the tooltip
      let tooltipX = mouseX + 10;
      let tooltipY = marginTop + 20;

      // Ensure the tooltip stays within the bounds of the chart
      if (tooltipX + tooltipWidth > width) {
        tooltipX = mouseX - tooltipWidth - 10;
      }
      if (tooltipY + tooltipHeight > height - marginBottom) {
        tooltipY = height - marginBottom - tooltipHeight - 10;
      }

      // Create the tooltip box with shadows
      chartArea.append("rect")
        .attr("class", "tooltip-box")
        .attr("x", Math.max(leftLimit, tooltipX))
        .attr("y", tooltipY)
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("fill", "#1E1E1E")
        .style("filter", "drop-shadow(0px 6px 6px rgba(0, 0, 0, 0.25))");

      // Add the date text to the tooltip
      chartArea.append("text")
        .attr("class", "tooltip-text")
        .attr("x", tooltipX + 10)
        .attr("y", tooltipY + 20)
        .attr("fill", "#E5C46B")
        .attr("font-size", "14px")
        .text(`${mouseDate.toISOString().split("T")[0]}`);

      // Add the y-values for all ecosystems to the tooltip
      yValues.forEach((data, i) => {
        const color = (ECOSYSTEMS_CONFIG as any)[data.name]?.color || 'gray';
        const yPosition = tooltipY + 40 + i * rowHeight;

        // Draw colored square boxes in front of ecosystem names
        chartArea.append("rect")
          .attr("class", "ecosystem-square")
          .attr("x", tooltipX + 10)
          .attr("y", yPosition - 10)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color)
          .attr("stroke", "white")
          .attr("stroke-width", 1);

        // Add the ecosystem name
        chartArea.append("text")
          .attr("class", "tooltip-text")
          .attr("x", tooltipX + 30)
          .attr("y", yPosition)
          .attr("fill", "white")
          .attr("font-size", "13px")
          .attr("dominant-baseline", "middle")
          .text(data.name);

        // Add the percentage value
        chartArea.append("text")
          .attr("class", "tooltip-text")
          .attr("x", tooltipX + 120)
          .attr("y", yPosition)
          .attr("fill", color)
          .attr("font-size", "13px")
          .attr("dominant-baseline", "middle")
          .text(data.value);
      });

      // Add squares along the dotted line for each ecosystem with linear transition
      yValues.forEach((data) => {
        const dataset = datasets[data.name];
        if (dataset) {
          const closestDataPoint = dataset.reduce((a, b) =>
            Math.abs(xScale(a.date) - mouseX) < Math.abs(xScale(b.date) - mouseX) ? a : b
          );

          const intersectionY = yScale(closestDataPoint.value);

          // Draw square at this y-coordinate on the dotted line with smooth transition
          chartArea.append("rect")
            .attr("class", "intersection-square")
            .attr("x", mouseX - 6)
            .attr("y", intersectionY - 6)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", (ECOSYSTEMS_CONFIG as any)[data.name]?.color || 'gray')
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .transition()
            .duration(100)
            .ease(d3.easeLinear);
        }
      });
    });

    // Handle mouse wheel events for zooming (if needed)
    svg.on("wheel", handleWheel);
  };



  // Adjust xDomain based on chartType (but ensure lengths stay consistent)
  useEffect(() => {
    const newDatasets: { [key: string]: DataPoint[] } = {};
    const now = new Date(); // Current date
    const endDate = now; // Set the current date as the end date
    const startDate = new Date('2021-01-01'); // Start date is fixed to Jan 1, 2021

    ecosystems.forEach((ecosystem) => {
      const generatedData = generateDataForDays(startDate, endDate); // Use generateDataForDays for daily data
      newDatasets[ecosystem] = generatedData;
    });

    setDatasets(newDatasets);

    // Set xDomain based on the chartType
    let xStartDate = startDate;

    if (chartType === 'Daily') {
      xStartDate = new Date(now);
      xStartDate.setDate(now.getDate() - 12); // Show data for the last 12 days
    } else if (chartType === 'Weekly') {
      xStartDate = new Date(now);
      xStartDate.setDate(now.getDate() - (12 * 7)); // Show data for the last 12 weeks (12 * 7 days)
    } else if (chartType === 'Monthly') {
      xStartDate = new Date(now);
      xStartDate.setMonth(now.getMonth() - 12); // Show data for the last 12 months
    } else if (chartType === 'Yearly') {
      xStartDate = new Date(now);
      xStartDate.setFullYear(now.getFullYear() - 3); // Show data for the last 3 years
    }

    setXDomain([xStartDate, endDate]); // Update xDomain based on start and end dates
  }, [ecosystems, chartType]); // Dependencies include ecosystems and chartType




  useEffect(() => {
    drawChart();
  }, [datasets, xDomain, ecosystems, chartType]); // Add ecosystems and datasets to dependency array

  return (
    <div>
      <div ref={chartRef}></div>
    </div>
  );
};

export default ChartWidget;
































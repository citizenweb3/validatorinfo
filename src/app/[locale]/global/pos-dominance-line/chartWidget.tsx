'use client';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { generateDataForYears } from './data'; // Ensure this function generates data correctly
import { FC } from 'react';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import centralized ecosystem config

interface ChartWidgetProps {
  chartType: string;
  ecosystems: string[];
}

type DataPoint = {
  date: Date;
  value: number;
};

const ChartWidget: FC<ChartWidgetProps> = ({ chartType, ecosystems }) => {
  const [datasets, setDatasets] = useState<{ [key: string]: DataPoint[] }>({});
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: string, y: string[] }>({ x: '', y: [] });

  const width = 1000;
  const height = 250;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  // Default start date is set to Jan 1, 2021
  const minDate = new Date('2021-01-01');
  const [xDomain, setXDomain] = useState<[Date, Date]>([minDate, new Date()]); // Set end date to current date

  const xScale = d3.scaleUtc()
    .domain(xDomain)
    .range([marginLeft, width - marginRight]);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height - marginBottom, marginTop]);

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

  const drawChart = () => {
    if (!chartRef.current) return;

    d3.select(chartRef.current).select("svg").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const chartArea = svg.append("g")
      .attr("clip-path", "url(#chart-clip)");

    svg.append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom);

    xScale.domain(xDomain);

    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("path, line")
      .attr("stroke", "#666666"); // Change x-axis color

    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).ticks(5)) // Interval on y-axis is 20
      .selectAll("path, line")
      .attr("stroke", "#666666"); // Change y-axis color

    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    const renderLine = (dataset: DataPoint[], ecosystem: string) => {
      if (!dataset || dataset.length === 0) {
        console.warn(`No data available for ecosystem: ${ecosystem}`);
        return;
      }

      const color = (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color || 'gray';
      chartArea.append("path")
        .datum(dataset)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-opacity", 0.8) // Add transparency
        .attr("stroke-width", 2)
        .attr("d", lineGenerator)
        .attr("data-ecosystem", ecosystem); // Add ecosystem as a data attribute for tooltips
    };

    ecosystems.forEach((ecosystem) => {
      const dataset = datasets[ecosystem];
      if (dataset) renderLine(dataset, ecosystem);
    });

    svg.on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event);
      const mouseDate = xScale.invert(mouseX);

      const yValues = ecosystems.map(ecosystem => {
        const dataset = datasets[ecosystem];
        if (!dataset) return 'N/A';
        const closest = dataset.reduce((a, b) => Math.abs(a.date.getTime() - mouseDate.getTime()) < Math.abs(b.date.getTime() - mouseDate.getTime()) ? a : b);
        return closest.value.toFixed(2);
      });

      setTooltip({
        x: mouseDate.toISOString().split("T")[0],
        y: yValues,
      });

      chartArea.selectAll(".dotted-line").remove();
      chartArea.append("line")
        .attr("class", "dotted-line")
        .attr("x1", mouseX)
        .attr("y1", marginTop)
        .attr("x2", mouseX)
        .attr("y2", height - marginBottom)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "4");

      chartArea.selectAll(".tooltip-text").remove();
      chartArea.append("text")
        .attr("class", "tooltip-text")
        .attr("x", mouseX + 5)
        .attr("y", marginTop + 10)
        .attr("fill", "black")
        .text(`X: ${mouseDate.toISOString().split("T")[0]}, Y: ${yValues.join(", ")}`);
    });

    svg.on("wheel", handleWheel);
  };

  // Generate data for each selected ecosystem when ecosystems or chartType change
  useEffect(() => {
    const newDatasets: { [key: string]: DataPoint[] } = {};
    ecosystems.forEach((ecosystem) => {
      const generatedData = generateDataForYears(2021); // Adjust to your dynamic function
      const datasetKey = `dataset${chartType === 'Daily' ? 1 : chartType === 'Weekly' ? 2 : 3}`;
      const selectedDataset = (generatedData as { [key: string]: DataPoint[] })[datasetKey];
      newDatasets[ecosystem] = selectedDataset;
    });
    setDatasets(newDatasets);

    const now = new Date(); // Current date
    const endDate = now;  // Set the current date as the end date
    let startDate = new Date('2021-01-01'); // Start date is fixed to Jan 1, 2021

    // Set xDomain based on the chartType
    if (chartType === 'Daily') {
      startDate = new Date(now);  // Start date is current date
      startDate.setDate(now.getDate() - 12); // Show data for last 12 days
    } else if (chartType === 'Weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (12 * 7)); // Show data for last 12 weeks (12*7 days)
    } else if (chartType === 'Monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 12); // Show data for last 12 months
    }

    setXDomain([startDate, endDate]); // Update xDomain based on start and end dates
  }, [ecosystems, chartType]); // Dependencies include ecosystems and chartType

  useEffect(() => {
    drawChart();
  }, [datasets, xDomain, ecosystems, chartType]); // Add ecosystems and datasets to dependency array

  return (
    <div>
      <div ref={chartRef}></div>
      <div>
        <p>X: {tooltip.x}</p>
        <p>Y: {tooltip.y.join(', ')}</p>
      </div>
    </div>
  );
};

export default ChartWidget;

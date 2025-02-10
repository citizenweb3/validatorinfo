'use client';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { generateDataForDays } from './generateDataTotalLine'; // Importing function to generate data
import { FC } from 'react';

// Define the DataPoint type to structure the data
type DataPoint = {
  date: Date;
  value: number;
};

// Interface to define expected props for the chart component
interface ChartWidgetProps {
  chartType: string;
}

const PosTotalChartWidget: FC<ChartWidgetProps> = ({ chartType }) => {
  const [datasets, setDatasets] = useState<{ tvs: DataPoint[]; rewards: DataPoint[] }>({
    tvs: [],
    rewards: [],
  });

  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: string; y: { name: string; value: string }[] }>({
    x: '',
    y: [],
  });

  const width = 1100;
  const height = 200;
  const marginTop = 5;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 105;
  const minDate = new Date('2021-01-01');
  const [xDomain, setXDomain] = useState<[Date, Date]>([minDate, new Date() ]);

  

  const xScale = d3.scaleUtc().domain(xDomain).range([marginLeft, width ]);
  const yScale = d3.scaleLinear().domain([0, 100]).range([height - marginBottom, marginTop]);

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;

    const [start, end] = xDomain;
    const newStart = new Date(start);
    const newEnd = new Date(end);

    newStart.setMonth(newStart.getMonth() + delta);
    newEnd.setMonth(newEnd.getMonth() + delta);

    if (newStart >= minDate && newEnd <= new Date()) {
      setXDomain([newStart, newEnd]);
    }
  };

  const drawChart = () => {
    if (!chartRef.current) return;
    d3.select(chartRef.current).select('svg').remove();
    const svg = d3.select(chartRef.current).append('svg').attr('width', width).attr('height', height);
    const chartArea = svg.append('g').attr('clip-path', 'url(#chart-clip)');

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('x', marginLeft + 20)
      .attr('y', marginTop)
      .attr('width', width - 40 )
      .attr('height', height - marginTop - marginBottom);

    xScale.domain(xDomain);
    yScale.domain([0, 100]);

    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('path, line')
      .attr('stroke', '#3E3E3E');

    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('path, line, .tick line')
      .attr('stroke', '#3E3E3E');

    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    const renderLine = (dataset: DataPoint[], color: string, lineName: string) => {
      if (!dataset || dataset.length === 0) return;
      chartArea.append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator);
    };

    renderLine(datasets.tvs, '#4FB848', 'TVS');
    renderLine(datasets.rewards, '#E5C46B', 'Rewards');

    // Add legends at the bottom and center them
    const legend = svg.append('g')
      .attr('transform', `translate(${width / 2 - 100}, ${height - marginBottom + 20})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#4FB848');

    legend.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .attr('fill', '#3E3E3E')
      .attr('font-size', '12px')
      .text('TVS');

    legend.append('rect')
      .attr('x', 100)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#E5C46B');

    legend.append('text')
      .attr('x', 120)
      .attr('y', 10)
      .attr('fill', '#3E3E3E')
      .attr('font-size', '12px')
      .text('Rewards');

    svg.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      const mouseDate = xScale.invert(mouseX);

      const yValues = [
        { name: 'TVS', value: findClosestValue(datasets.tvs, mouseDate) },
        { name: 'Rewards', value: findClosestValue(datasets.rewards, mouseDate) },
      ];

      setTooltip({
        x: mouseDate.toISOString().split('T')[0],
        y: yValues,
      });

      // Remove old elements before creating new ones
      chartArea.selectAll('.dotted-line, .tooltip-box, .tooltip-text, .ecosystem-square, .intersection-square').remove();

      // Draw a dotted vertical line at the mouse position
      chartArea.append('line')
        .attr('class', 'dotted-line')
        .attr('x1', mouseX)
        .attr('y1', marginTop)
        .attr('x2', mouseX)
        .attr('y2', height - marginBottom)
        .attr('stroke', '#E5C46B')
        .attr('stroke-dasharray', '2, 2');

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
      chartArea.append('rect')
        .attr('class', 'tooltip-box')
        .attr('x', tooltipX)
        .attr('y', tooltipY)
        .attr('width', tooltipWidth)
        .attr('height', tooltipHeight)
        .attr('fill', '#1E1E1E')
        .style('filter', 'drop-shadow(0px 6px 6px rgba(0, 0, 0, 0.25))');

      // Add the date text to the tooltip
      chartArea.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', tooltipX + 10)
        .attr('y', tooltipY + 20)
        .attr('fill', '#E5C46B')
        .attr('font-size', '14px')
        .text(`${mouseDate.toISOString().split('T')[0]}`);

      // Add the y-values for all ecosystems to the tooltip
      yValues.forEach((data, i) => {
        const color = data.name === 'TVS' ? '#4FB848' : '#E5C46B';
        const yPosition = tooltipY + 40 + i * rowHeight;

        // Draw colored square boxes in front of ecosystem names
        chartArea.append('rect')
          .attr('class', 'ecosystem-square')
          .attr('x', tooltipX + 10)
          .attr('y', yPosition - 10)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', color)
          .attr('stroke', 'white')
          .attr('stroke-width', 1);

        // Add the ecosystem name
        chartArea.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + 30)
          .attr('y', yPosition)
          .attr('fill', 'white')
          .attr('font-size', '13px')
          .attr('dominant-baseline', 'middle')
          .text(data.name);

        // Add the percentage value
        chartArea.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', tooltipX + 120)
          .attr('y', yPosition)
          .attr('fill', color)
          .attr('font-size', '13px')
          .attr('dominant-baseline', 'middle')
          .text(data.value);
      });

      // Add squares along the dotted line for each ecosystem with linear transition
      yValues.forEach((data) => {
        const dataset = data.name === 'TVS' ? datasets.tvs : datasets.rewards;
        if (dataset) {
          const closestDataPoint = dataset.reduce((a, b) =>
            Math.abs(xScale(a.date) - mouseX) < Math.abs(xScale(b.date) - mouseX) ? a : b
          );

          const intersectionY = yScale(closestDataPoint.value);

          // Draw square at this y-coordinate on the dotted line with smooth transition
          chartArea.append('rect')
            .attr('class', 'intersection-square')
            .attr('x', mouseX - 6)
            .attr('y', intersectionY - 6)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', data.name === 'TVS' ? '#4FB848' : '#E5C46B')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .transition()
            .duration(100)
            .ease(d3.easeLinear);
        }
      });
    });

    svg.on('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 1 : -1;

      const [start, end] = xDomain;
      const newStart = new Date(start);
      const newEnd = new Date(end);

      newStart.setMonth(newStart.getMonth() + delta);
      newEnd.setMonth(newEnd.getMonth() + delta);

      if (newStart >= minDate && newEnd <= new Date()) {
        setXDomain([newStart, newEnd]);
        // Fetch new data for the updated range
        const newDatasets = generateDataForDays(newStart, newEnd);
        setDatasets(newDatasets);
      }
    });
  };



  
  

  const findClosestValue = (dataset: DataPoint[], targetDate: Date) => {
    const closest = dataset.reduce((a, b) =>
      Math.abs(a.date.getTime() - targetDate.getTime()) < Math.abs(b.date.getTime() - targetDate.getTime()) ? a : b
    );
    return `${closest.value.toFixed(2)}%`;
  };

  useEffect(() => {
    const now = new Date();
    let startDate = new Date('2021-01-01');
    const endDate = now;

    if (chartType === 'Daily') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 12);
    } else if (chartType === 'Weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (12 * 7));
    } else if (chartType === 'Monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 12);
    } else if (chartType === 'Yearly') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 3);
    }

    setXDomain([startDate, endDate]);
    const newDatasets = generateDataForDays(startDate, endDate);
    setDatasets(newDatasets);
  }, [chartType]);

  useEffect(() => {
    if (datasets.tvs.length > 0 && datasets.rewards.length > 0) {
      drawChart();
    }
  }, [datasets, xDomain]);

  return <div ref={chartRef} style={{ position: 'relative', width: '100%', height: '100%' }}></div>;
};

export default PosTotalChartWidget;

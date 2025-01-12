'use client';

import { FC, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { D3ZoomEvent } from 'd3';
import ChartButtons from '@/app/validator_comparison/chart-buttons';
import { generateData } from './data';

interface DataPoint {
  x: string;
  y: number;
}

interface DataSet {
  category: string;
  values: DataPoint[];
}

const ALL_CHAINS = [
  'POW', 'Cosmos', 'Near', 'Polkadot', 'Ton', 'Ethereum',
  'Solana', 'Cardano', 'IOTA', 'ICP', 'Tezos', 'Gnosis', 'Avalanche'
] as const;

const colorScheme: { [key in string]: string } = {
  'POW': '#e67e22',
  'Polkadot': '#3498db',
  'ETH': '#f1c40f',
  'Cosmos': '#2ecc71',
  'Near': '#9b59b6',
  'Ton': '#e74c3c',
  'Ethereum': '#f1c40f',
  'Solana': '#1abc9c',
  'Cardano': '#34495e',
  'IOTA': '#95a5a6',
  'ICP': '#16a085',
  'Tezos': '#2980b9',
  'Gnosis': '#8e44ad',
  'Avalanche': '#c0392b'
};

const PosDominanceLine: FC = () => {
  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string>('Daily');
  const [selectedEcosystems, setSelectedEcosystems] = useState<string[]>(['POW', 'Cosmos', 'Polkadot', 'ETH']);
  const [filteredData, setFilteredData] = useState<DataSet[]>([]);
  const [error, setError] = useState<string>('');
  const [scrollPosition, setScrollPosition] = useState(0);

  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderChart = () => {
    if (!chartRef.current || !containerRef.current || !filteredData.length) {
      console.log('Early return conditions:', {
        chartRef: !!chartRef.current,
        containerRef: !!containerRef.current,
        filteredDataLength: filteredData.length
      });
      return;
    }

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = Math.min(containerWidth * 0.35, 300);

    const margin = { top: 20, right: 50, bottom: 30, left: 80 };
    const visibleWidth = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Calculate total width based on data points
    const totalPoints = filteredData[0].values.length;
    const pointSpacing = 10; // Reduced spacing between points
    const totalWidth = Math.max(visibleWidth, totalPoints * pointSpacing);

    // Create main container
    const container = d3.select(chartRef.current)
      .style('overflow-x', 'auto')
      .style('overflow-y', 'hidden')
      .style('position', 'relative');

    // Create SVG
    const svg = container.append('svg')
      .attr('width', totalWidth + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', 'transparent')
      .style('display', 'block'); // Ensure SVG is displayed

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData[0].values, d => new Date(d.x)) as [Date, Date])
      .range([0, totalWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Line generator
    const line = d3.line<DataPoint>()
      .x(d => xScale(new Date(d.x)))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Add lines
    filteredData.forEach(dataset => {
      g.append('path')
        .datum(dataset.values)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', colorScheme[dataset.category])
        .attr('stroke-width', 2)
        .attr('d', line);
    });

    // Add and style axes
    const xAxis = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);

    const yAxis = g.append('g')
      .attr('class', 'y-axis');

    // Style x-axis
    xAxis.call(d3.axisBottom(xScale) as any)
      .selectAll('text')
      .style('fill', '#ffffff');

    xAxis.selectAll('line')
      .style('stroke', '#1f2937');

    xAxis.selectAll('path')
      .style('stroke', '#1f2937');

    // Style y-axis
    yAxis.call(d3.axisLeft(yScale) as any)
      .selectAll('text')
      .style('fill', '#ffffff');

    yAxis.selectAll('line')
      .style('stroke', '#1f2937');

    yAxis.selectAll('path')
      .style('stroke', '#1f2937');

    // Add tooltip
    const tooltip = container.append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    // Handle scroll events
    container.node()?.addEventListener('scroll', (event) => {
      const scrollLeft = (event.target as HTMLElement).scrollLeft;
      setScrollPosition(scrollLeft);
    });

    console.log('Chart rendered successfully');
  };

  useEffect(() => {
    try {
      console.log('Generating data with:', { chartType, selectedEcosystems });
      const data = generateData(chartType, selectedEcosystems);
      console.log('Generated data:', data);
      setFilteredData(data);
      setError('');
    } catch (e) {
      console.error('Error generating data:', e);
      setError('Failed to generate data. Please try again.');
    }
  }, [chartType, selectedEcosystems]);

  useEffect(() => {
    if (isChart && filteredData.length > 0) {
      console.log('Rendering chart with filtered data:', filteredData);
      renderChart();
    }
  }, [isChart, filteredData]);

  useEffect(() => {
    const handleResize = () => {
      if (isChart && filteredData.length > 0) {
        renderChart();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isChart, filteredData]);

  return (
    <div className="flex flex-col w-full p-4 bg-gray-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <ChartButtons
          onlyDays
          isChart={isChart}
          onChartChanged={(value) => {
            setIsChart(value);
            setChartType(value ? 'Daily' : '');
          }}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name)}
        />

        <div className="w-full sm:w-auto">
          <select
            className="bg-gray-800 text-white p-2 rounded border border-gray-700 w-full sm:w-auto"
            multiple
            size={5}
            value={selectedEcosystems}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              const newSelection = values.includes('all') ? [...ALL_CHAINS] : values;
              setSelectedEcosystems(newSelection.length === 0 ? selectedEcosystems : newSelection);
            }}
          >
            <option value="all">All Chains</option>
            {ALL_CHAINS.map(chain => (
              <option key={chain} value={chain} className="py-1">
                {chain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4 px-4 py-2 bg-red-900/20 rounded">
          {error}
        </div>
      )}

      <div ref={containerRef} className="w-full bg-gray-800 rounded-lg p-4">
        <div 
          ref={chartRef} 
          className="w-full min-h-[300px]"
          style={{
            position: 'relative',
            userSelect: 'none',
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-4 justify-center p-4 bg-gray-800 rounded-lg">
        {selectedEcosystems.map(ecosystem => (
          <div key={ecosystem} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorScheme[ecosystem] }}
            />
            <span className="text-sm text-gray-200">{ecosystem}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PosDominanceLine;
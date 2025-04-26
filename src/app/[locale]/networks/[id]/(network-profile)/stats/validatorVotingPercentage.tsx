'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Validator {
    name: string;
    percent: number;
}

interface Props {
    data: Validator[];
    height?: number;
}

const PowerBarChart: React.FC<Props> = ({ data, height = 320 }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scrollIndex, setScrollIndex] = useState(0);

    const MAX_VISIBLE = 26;
    const BAR_WIDTH = 27;
    const BAR_GAP = 16;
    const BAR_TOTAL = BAR_WIDTH + BAR_GAP;
    const initialGap = 40;

    const getColor = (percent: number) => {
        if (percent > 4) return '#EB1616B2';
        if (percent >= 2) return '#E5C46BB2';
        return '#4FB848B2';
    };

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const sortedData = [...data].sort((a, b) => b.percent - a.percent);
        const totalBars = sortedData.length;

        const maxScrollIndex = Math.max(0, totalBars - MAX_VISIBLE);
        const clampedScrollIndex = Math.min(scrollIndex, maxScrollIndex);
        const visibleData = sortedData.slice(clampedScrollIndex, clampedScrollIndex + MAX_VISIBLE);

        const chartWidth = MAX_VISIBLE * BAR_TOTAL + initialGap + 60 + 180;
        const margin = { top: 40, right: 60, bottom: 60, left: 60 };
        const innerHeight = height - margin.top - margin.bottom;

        // ✅ Responsive SVG setup
        svg
            .attr('viewBox', `0 0 ${chartWidth} ${height}`)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .style('width', '100%')
            .style('height', 'auto');

        const y = d3.scaleLinear()
            .domain([0, (d3.max(sortedData, d => d.percent) || 10) * 1.1])
            .range([innerHeight, 0]);

        const x = d3.scaleBand()
            .domain(visibleData.map(d => d.name))
            .range([0, MAX_VISIBLE * BAR_TOTAL])
            .paddingInner(0)
            .paddingOuter(0);

        const chartArea = svg.append('g')
            .attr('class', 'chart-area')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Y-axis
        chartArea.append('g')
            .call(d3.axisLeft(y)
                .tickFormat(d => `${d}%`)
                .tickValues(d3.range(0, (d3.max(sortedData, d => d.percent) || 10) * 1.1, 2))
                .tickSize(0)
            )
            .call(g => g.selectAll('text')
                .attr('fill', '#FFFFFFE5')
                .attr('x', -30)
                .attr('text-anchor', 'end')
                .attr('dy', '0.32em')
            )
            .call(g => g.select('.domain').attr('stroke', '#3E3E3E'))
            .call(g => g.selectAll('line').remove());

        // Y-axis label
        chartArea.append('text')
            .attr('x', -30)
            .attr('y', -5)
            .attr('text-anchor', 'start')
            .attr('fill', '#FFFFFF')
            .attr('font-size', '16px')
            .attr('font-family', 'var(--font-sfpro)')
            .text('VP');

        // X-axis line
        chartArea.append('line')
            .attr('x1', 0)
            .attr('x2', visibleData.length * BAR_TOTAL + 3 * BAR_TOTAL)
            .attr('y1', innerHeight)
            .attr('y2', innerHeight)
            .attr('stroke', '#3E3E3E')
            .attr('stroke-width', 1);

        // Bars
        chartArea.selectAll('.bar')
            .data(visibleData)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => i * BAR_TOTAL + initialGap)
            .attr('y', d => y(d.percent))
            .attr('width', BAR_WIDTH)
            .attr('height', d => innerHeight - y(d.percent))
            .attr('fill', d => getColor(d.percent));

        // Highlight border
        const highlightRect = chartArea.append('rect')
            .attr('class', 'highlight-rect')
            .attr('fill', 'none')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('rx', 2)
            .attr('ry', 2)
            .style('pointer-events', 'none')
            .style('opacity', 0);

        // Tooltip (HTML)
        const tooltip = d3.select(containerRef.current)
            .append('div')
            .attr('class', 'bar-tooltip')
            .style('position', 'absolute')
            .style('top', '30px')
            .style('left', '0')
            .style('padding', '10px 14px')
            .style('background', '#1E1E1E')
            .style('border-radius', '6px')
            .style('color', '#fff')
            .style('font-size', '13.75px')
            .attr('font-family', 'var(--font-handjet)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.5)')
            .style('width', 'auto')
            .style('height', '38px')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'space-between');

        // Hover zones
        chartArea.selectAll('.hover-zone')
            .data(visibleData.map((d, i) => ({ ...d, index: i })))
            .join('rect')
            .attr('class', 'hover-zone')
            .attr('x', d => d.index * BAR_TOTAL + initialGap)
            .attr('y', 0)
            .attr('width', BAR_WIDTH)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mousemove', (event, d) => {
                const [mouseX] = d3.pointer(event, svgRef.current);
                const color = getColor(d.percent);

                tooltip
                    .style('left', `${mouseX + 20}px`)
                    .style('opacity', 1)
                    .html(`
            <div style="display: flex; justify-content: space-between; width: 100%; gap: 10px;">
             <span style="color: #FFFFFF;font-size: 16px;font-weight: 500;font-family: var(--font-sfpro);max-width: 160px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;display: inline-block;">
                ${d.name}
              </span>
              <span style="color: ${color};font-size: 16px;font-weight: bold;font-family: var(--font-sfpro);">
                ${d.percent.toFixed(2)}%
              </span>
            </div>
          `);
                highlightRect
                    .attr('x', d.index * BAR_TOTAL + initialGap - 1)
                    .attr('y', y(d.percent) - 1)
                    .attr('width', BAR_WIDTH + 2)
                    .attr('height', innerHeight - y(d.percent) + 2)
                    .style('opacity', 1);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', 0);
                highlightRect.style('opacity', 0);
            });

        return () => {
            tooltip.remove();
        };
    }, [data, height, scrollIndex]);

    useEffect(() => {
        const sortedData = [...data].sort((a, b) => b.percent - a.percent);
        const maxScrollIndex = Math.max(0, sortedData.length - MAX_VISIBLE);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setScrollIndex(prev => Math.min(prev + 1, maxScrollIndex));
            } else if (e.key === 'ArrowLeft') {
                setScrollIndex(prev => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [data]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'visible',
            }}
        >
            <svg
                ref={svgRef}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                preserveAspectRatio="xMinYMin meet"
            />
        </div>
    );
};

export default PowerBarChart;
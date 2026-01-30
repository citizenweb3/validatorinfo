import { Plugin } from 'chart.js';

export const chartAreaBackgroundPlugin: Plugin<'line'> = {
  id: 'chartAreaBackgroundPlugin',

  beforeDraw(chart) {
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (!chartArea) return;

    ctx.save();
    ctx.fillStyle = '#181818';
    ctx.fillRect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top
    );
    ctx.restore();
  },
};

export default chartAreaBackgroundPlugin;

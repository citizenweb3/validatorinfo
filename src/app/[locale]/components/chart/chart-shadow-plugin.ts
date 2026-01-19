import { Plugin } from 'chart.js';

export const shadowPlugin: Plugin<'line'> = {
  id: 'shadowPlugin',

  beforeDatasetDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
  },

  afterDatasetDraw(chart) {
    chart.ctx.restore();
  },
};

export default shadowPlugin;

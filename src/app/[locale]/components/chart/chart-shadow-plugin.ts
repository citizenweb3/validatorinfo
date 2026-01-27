import { Plugin } from 'chart.js';

export const shadowPlugin: Plugin<'line'> = {
  id: 'shadowPlugin',

  beforeDatasetDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;
  },

  afterDatasetDraw(chart) {
    chart.ctx.restore();
  },
};

export default shadowPlugin;

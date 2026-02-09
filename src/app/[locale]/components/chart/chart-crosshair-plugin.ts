import { Chart, Plugin } from 'chart.js';

export const crosshairPlugin: Plugin<'line'> = {
  id: 'crosshairPlugin',

  afterDraw(chart: Chart<'line'>) {
    const tooltip = chart.tooltip;
    if (!tooltip || !tooltip.getActiveElements().length) return;

    const ctx = chart.ctx;
    const activeElements = tooltip.getActiveElements();
    if (activeElements.length === 0) return;

    const activePoint = activeElements[0];
    const x = activePoint.element.x;
    const topY = chart.scales.y.top;
    const bottomY = chart.scales.y.bottom;

    ctx.save();

    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = '#E5C46B';
    ctx.lineWidth = 1;
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.stroke();
    ctx.setLineDash([]);

    activeElements.forEach((element) => {
      const datasetIndex = element.datasetIndex;
      const dataset = chart.data.datasets[datasetIndex];
      const borderColor = dataset.borderColor as string;
      const pointX = element.element.x;
      const pointY = element.element.y;

      const squareSize = 8;
      const halfSize = squareSize / 2;

      ctx.fillStyle = borderColor;
      ctx.fillRect(pointX - halfSize, pointY - halfSize, squareSize, squareSize);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(pointX - halfSize, pointY - halfSize, squareSize, squareSize);
    });

    ctx.restore();
  },
};

export default crosshairPlugin;

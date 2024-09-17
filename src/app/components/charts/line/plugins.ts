export const lineHoverEffect = (
  activeId: string,
  isActive: boolean,
  onHover: (id: string, isHovered: boolean) => void,
) => ({
  id: 'lineHoverEffect',
  isHovered: false,
  // @ts-ignore
  afterEvent(chart, args) {
    const { x, y } = args.event;
    const chartArea = chart.chartArea;
    const datasetMeta = chart.getDatasetMeta(0).data;

    const isWithinChartArea =
      x >= chartArea.left && x <= chartArea.right && y >= chartArea.top && y <= chartArea.bottom;

    const isNearLine = datasetMeta.some((element: any) => {
      const { x: pointX, y: pointY } = element.getCenterPoint();
      const radius = 5;

      return Math.abs(x - pointX) < radius && Math.abs(y - pointY) < radius;
    });

    this.isHovered = isWithinChartArea && isNearLine;

    if (this.isHovered) {
      requestAnimationFrame(() => {
        chart.update();
      });
    }

    onHover(activeId, this.isHovered);
  },
  beforeDraw(chart: any) {
    if (!this.isHovered && !isActive) return;

    const { ctx } = chart;
    const datasetMeta = chart.getDatasetMeta(0).data;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#363636';
    ctx.beginPath();

    datasetMeta.forEach((element: any, index: number) => {
      const { x, y } = element.getCenterPoint();
      const yOffset = y + 2;

      if (index > 0) {
        const previousElement = datasetMeta[index - 1];
        const { x: prevX, y: prevY } = previousElement.getCenterPoint();
        const prevYOffset = prevY + 2;

        ctx.moveTo(prevX, prevYOffset);
        ctx.lineTo(x, yOffset);
      }
    });

    ctx.stroke();
    ctx.restore();
  },
});

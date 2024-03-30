export class LineChartData  {
  constructor(public readonly data: number[], public readonly color: string) {
  }
}

export class LineChartsData {
  constructor(public readonly data: LineChartData[]) {
  }
}

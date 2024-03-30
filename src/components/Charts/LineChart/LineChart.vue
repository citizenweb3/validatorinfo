<template>
    <div style="width: 400px">
      <LineChart v-bind="lineChartProps" />
    </div>
  </template>

  <script lang='ts'>
  import { computed, defineComponent, ref } from "vue";
  import { LineChart, useLineChart } from "vue-chart-3";
  import { Chart, ChartData, ChartOptions, registerables } from "chart.js";
import { withInstallDirective } from "element-plus/es/utils";
  import { LineChartData, LineChartsData } from "./LineChartData";

  Chart.register(...registerables);
  export default defineComponent({
    name: "PieChart",
    props: {
      data: { type: LineChartsData, required: true},

      labels: { type: Array, required: true },
    },
    components: { LineChart },
    setup(props) {
      const dataValues = computed(() => props.data);
      const dataLabels = computed(() => props.labels);

      // Demo chart https://codesandbox.io/p/sandbox/demo-vue-chart-3-ugynm?from-embed=

      const testData = computed<ChartData<"line">>(() => ({
        labels: dataLabels.value,
        datasets: dataValues.value.data.map((d: LineChartData) => ({
            data: d.data,
            borderColor: d.color
          }))}))

      const options = computed<ChartOptions<"line">>(() => ({
        scales: {
            x: {
                border: {
                    display: true,
                    color: "#26272a"
                },
                grid: {
                    display: true,
                    color: "#26272a"
                }
            },
            y: {
                border: {
                    display: true,
                    color: "#26272a"
                },
                grid: {
                    display: true,
                    color: "#26272a"
                }
            }
        },
        plugins: {
          legend: {
            display: false
          },
        },
        layout: {
            padding: 10
        },
        elements: {
            arc: {
                borderWidth: 0
            }
        }
      }));

      const { lineChartProps, lineChartRef } = useLineChart({
        chartData: testData,
        options,
      });


      return {
        testData,
        options,
        lineChartRef,
        lineChartProps,
      };
    },
  });
  </script>

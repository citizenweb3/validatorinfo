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
  
  Chart.register(...registerables);
  export default defineComponent({
    name: "PieChart",
    components: { LineChart },
    setup() {
      const dataValues = ref([0, 20, 40, 60, 80, 100]);
      const dataLabels = ref(["May 1", "May 8", "May 14", "May 21"]);

      // Demo chart https://codesandbox.io/p/sandbox/demo-vue-chart-3-ugynm?from-embed=

      const testData = computed<ChartData<"line">>(() => ({
        labels: dataLabels.value,
        datasets: [
          {
            data: dataValues.value,
            backgroundColor: [
              "#4FB848", // Green
              "#EB1616", // Red
              "#F3B101", // Yellow
              "#777676", // Grey
            ],
            borderColor: "#F3B101"
          },
        ],
      }));
  
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

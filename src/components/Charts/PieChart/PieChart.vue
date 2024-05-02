<template>
    <div style="width: 70px">
      <DoughnutChart v-bind="doughnutChartProps" />
    </div>
  </template>
  
  <script lang='ts'>
  import { computed, defineComponent, ref } from "vue";
  import { DoughnutChart, useDoughnutChart } from "vue-chart-3";
  import { Chart, ChartData, ChartOptions, registerables } from "chart.js";
  
  Chart.register(...registerables);
  export default defineComponent({
    name: "PieChart",
    components: { DoughnutChart },
    setup() {
      const dataValues = ref([5, 10, 15, 70]);
      const dataLabels = ref(["Paris", "Nîmes", "Toulon", "Perpignan"]);

      // Demo chart https://codesandbox.io/p/sandbox/demo-vue-chart-3-ugynm?from-embed=

      const testData = computed<ChartData<"doughnut">>(() => ({
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
          },
        ],
      }));
  
      const options = computed<ChartOptions<"doughnut">>(() => ({
        scales: {},
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
  
      const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
        chartData: testData,
        options,
      });

  
      return {
        testData,
        options,
        doughnutChartRef,
        doughnutChartProps,
      };
    },
  });
  </script>
  
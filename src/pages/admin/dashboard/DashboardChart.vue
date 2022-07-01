<template>
  <div class="row row-equal">
    <div class="flex xs12 md6 xl6">
      <va-card class="d-flex">
        <va-card-title>
          <h1>{{ $t("dashboard.charts.loadingSpeed") }}</h1>
          <div class="mr-0 text-right">
            <!-- <va-button icon="print" flat class="mr-0" @click="" /> -->
          </div>
        </va-card-title>
        <va-card-content v-if="option">
          <donut-chart :option="option" />
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DonutChart from "@/components/charts/DonutChart.vue";
import "echarts-liquidfill";

export default defineComponent({
  name: "DashboardChart",
  components: {
    DonutChart,
  },
  setup() {
    const option = {
      series: [
        {
          name: "外部刻度",
          type: "gauge",
          radius: "100%",
          min: 0,
          max: 100,
          splitNumber: 10,
          startAngle: 245,
          endAngle: -65,
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 0,
              opacity: 0,
              color: [
                [0.19, "#088AD5"],
                [1, "#d9d9d9"],
              ],
            },
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: true,
            splitNumber: 7,
            lineStyle: {
              color: "auto",
              width: 2,
            },
            length: 10,
          },
          splitLine: {
            show: true,
            length: 20,
            distance: 9,
            lineStyle: {
              color: "auto",
              width: 3,
            },
          },
          detail: {
            show: false,
          },
          pointer: {
            show: false,
          },
        },
        {
          name: "内部（环形）进度条",
          type: "gauge",
          radius: "70%",
          z: 4,
          startAngle: 245,
          endAngle: -65,
          axisLine: {
            lineStyle: {
              color: [[0.19, "#088AD5"]],
              width: 18,
            },
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          pointer: {
            show: false,
          },
          title: {
            show: true,
            offsetCenter: ["0%", "20%"],
            fontSize: 16,
            color: "#fff",
            height: 26,
          },
          detail: {
            show: true,
            color: "#fff",
            fontSize: 36,
            offsetCenter: ["0%", "-10%"],
          },
          data: [
            {
              name: 202103,
              value: 19,
            },
          ],
        },
        {
          name: "内部（环形）进度条背景",
          type: "gauge",
          radius: "74%",
          z: 3,
          startAngle: 245,
          endAngle: -65,
          axisLine: {
            lineStyle: {
              color: [[1, "rgba(8, 138, 213, 0.08)"]],
              width: 36,
            },
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          detail: {
            show: false,
          },
        },
        {
          type: "pie",
          radius: ["0", "46%"],
          itemStyle: {
            color: "#088AD5",
          },
          labelLine: {
            show: false,
          },
          hoverAnimation: false,
          data: [1],
        },
      ],
    };

    const option2 = {
      backgroundColor: "#222",
      title: {
        text: `{a|${33}}{b|%}`,
        x: "center",
        y: "center",
        subtext: "增长",
        subtextStyle: {
          color: "#fff",
          fontSize: 14,
        },
        itemGap: 2,
        textStyle: {
          rich: {
            a: {
              color: "#fff",
              fontSize: 20,
              fontWeight: "bold",
            },
            b: {
              color: "#fff",
              fontSize: 14,
            },
          },
        },
      },
      series: [
        {
          type: "liquidFill",
          waveAnimation: 10,
          radius: "100%",
          data: [0.35, 0.3],
          color: ["rgba(83, 211, 228, 0.79)", "rgba(83, 211, 228, 1)"],
          amplitude: 5,
          backgroundStyle: {
            color: {
              type: "radial",
              x: 0.5,
              y: 0.5,
              r: 0.55,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(7, 112, 135, 0.01)", // 100% 处的颜色
                },
                {
                  offset: 1,
                  color: "rgba(7, 112, 135, 0.69)",
                },
              ],
              globalCoord: false, // 缺省为 false
            },
          },
          outline: {
            show: false,
          },
          label: {
            show: false,
          },
        },
      ],
    };

    return {
      option,
      option2,
    };
  },
});
</script>

<style lang="">
</style>
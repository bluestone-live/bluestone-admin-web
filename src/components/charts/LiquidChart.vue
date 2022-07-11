<template>
  <base-chart id="liquid-chart" :option="option" />
</template>

<script lang="js">
import { defineComponent } from "vue";
import BaseChart from "./BaseChart.vue";
import * as echarts from "echarts";

export default defineComponent({
  name: "liquid-chart",
  components: {
    BaseChart,
  },
  props: ["option"],
  setup() {
    const payload = {
      id: "liquid-fill-5",
      color: ["#F37826", "#F39F26"],
      data: { data: "0.55" },
    };

    const data = payload.data.data;
    const color = payload.color;

    const option = {
      backgroundColor: "transparent",
      series: [
        {
          name: "水球图",
          type: "liquidFill",
          radius: "95%",
          center: ["50%", "50%"],
          waveAnimation: 10, // 动画时长
          amplitude: 5, // 振幅
          data: [data, data - 1 / 10],
          itemStyle: {
            //渐变色设置
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: color[0],
              },
              {
                offset: 1,
                color: color[1],
              },
            ]),
          },
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            colorStops: [
              {
                offset: 1,
                color: color[0],
              },
              {
                offset: 0,
                color: color[1],
              },
            ],
            globalCoord: false,
          },
          outline: {
            show: true,
            borderDistance: 0,
            itemStyle: {
              borderWidth: 2,
              borderColor: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: color[0],
                  },
                  {
                    offset: 1,
                    color: color[1],
                  },
                ],
                globalCoord: false,
              },
            },
          },
          backgroundStyle: {
            color: "#58A0AD",
          },
          label: {
            color: "#ffffff",
            insideColor: "#ffffff",
            fontSize: 14,
            formatter: (params) => {
              //console.log(params)
              const newValue = params.value * 100;
              return "" + newValue.toFixed(0) + "分";
            },
          },
        },
      ],
    };

    return {
      option,
    };
  },
});
</script>

<style lang="scss">
.chart-canvas {
  width: 100%;
  height: 400px;
}
</style>
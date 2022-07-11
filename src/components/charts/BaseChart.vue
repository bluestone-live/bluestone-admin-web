<template>
  <div :id="id" class="chart-canvas"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import * as echarts from "echarts";
export default defineComponent({
  name: "base-chart",
  components: {},
  props: ["id", "option"],
  setup(props) {
    function drawChart() {
      let elem = document.getElementById(props.id);
      if (elem) {
        let myChart = echarts.init(elem);
        myChart.setOption(props.option);
      }
    }
    onMounted(() => {
      drawChart();
    });
  },
});
</script>

<style lang="scss" scoped>
.chart-canvas {
  width: 100%;
  height: 400px;
}
</style>
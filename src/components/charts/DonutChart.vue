<template>
  <div id="chart" style="width: 100%; height: 400px"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as echarts from "echarts";
export default defineComponent({
  name: "donut-chart",
  components: {},
  props: ["option"],
  setup(props) {
    function drawChart() {
      let elem = document.getElementById("chart");
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

<style lang="scss">
</style>
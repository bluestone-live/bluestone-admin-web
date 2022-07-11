<template>
  <div class="row row-equal">
    <div class="flex xs12 md6 xl6">
      <va-card class="d-flex">
        <va-card-title>
          <h1>{{ $t("dashboard.charts.treasury") }}</h1>
          <div class="mr-0 text-right">
            <!-- <va-button icon="print" flat class="mr-0" @click="" /> -->
          </div>
        </va-card-title>
        <va-card-content>
          <liquid-chart />
        </va-card-content>
      </va-card>
    </div>
    <div class="flex xs12 md6 xl6">
      <va-card class="d-flex">
        <va-card-title>
          <h1>{{ $t("dashboard.charts.status") }}</h1>
          <div class="mr-0 text-right">
            <!-- <va-button icon="print" flat class="mr-0" @click="" /> -->
          </div>
        </va-card-title>
        <va-card-content>
          <donut-chart />
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import DonutChart from "@/components/charts/DonutChart.vue";
import LiquidChart from "@/components/charts/LiquidChart.vue"
import "echarts-liquidfill";

export default defineComponent({
  name: "DashboardChart",
  components: {
    DonutChart,
    LiquidChart
  },
  setup() {


    return {

    };
  },
});
</script>

<style lang="">
</style>
<template>
  <div class="dashboard">
    <dashboard-info-block />
    <dashboard-chart />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DashboardInfoBlock from "./DashboardInfoBlock.vue";
import DashboardChart from "./DashboardChart.vue";

export default defineComponent({
  name: "Dashboard",
  components: {
    DashboardInfoBlock,
    DashboardChart
  },
});
</script>

<style lang="scss">
.row-equal .flex {
  .va-card {
    height: 100%;
  }
}

.dashboard {
  .va-card {
    margin-bottom: 0 !important;
    &__title {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
<template>
  <div class="dashboard">
    <Suspense>
      <template #fallback>
        <!-- <div>loading</div> -->
        <dashboard-info-loading />
      </template>

      <dashboard-info-block />
    </Suspense>
    <!-- <dashboard-chart /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DashboardInfoBlock from "./DashboardInfoBlock.vue";
import DashboardInfoLoading from "@/components/loading/DashboardInfoLoading.vue"
// import DashboardChart from "./DashboardChart.vue";

export default defineComponent({
  name: "Dashboard",
  components: {
    DashboardInfoBlock,
    DashboardInfoLoading
    // DashboardChart,
  },
  setup() {},
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
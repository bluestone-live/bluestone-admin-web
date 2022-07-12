<template>
  <div class="dashboard">
    <Suspense>
      <template #fallback>
        <!-- <div>loading</div> -->
        <dashboard-loading />
      </template>

      <dashboard-info-block />
    </Suspense>
    <!-- <dashboard-pools-status /> -->
    <!-- <dashboard-chart /> -->
    <!-- <SusPense> -->
    <!-- </SusPense> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DashboardInfoBlock from "./DashboardInfoBlock.vue";
import DashboardLoading from "@/components/loading/DashboardLoading.vue"
// import DashboardChart from "./DashboardChart.vue";

export default defineComponent({
  name: "Dashboard",
  components: {
    DashboardInfoBlock,
    DashboardLoading,
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
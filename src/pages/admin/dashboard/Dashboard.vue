<template>
  <div class="dashboard">
    <Suspense>
      <template #fallback>
        <dashboard-loading />
      </template>
      <dashboard-info-block />
    </Suspense>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DashboardInfoBlock from "./DashboardInfoBlock.vue";
import DashboardLoading from "@/components/loading/DashboardLoading.vue"

export default defineComponent({
  name: "Dashboard",
  components: {
    DashboardInfoBlock,
    DashboardLoading,
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
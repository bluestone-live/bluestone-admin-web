<template>
  <div class="loading-spinner">
    <scaling-squares-spinner
      :animation-duration="1000"
      :size="300"
      :color="'#6F92DA'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { ScalingSquaresSpinner } from "epic-spinners";
export default defineComponent({
  name: "LoanListLoading",
  components: {
    ScalingSquaresSpinner,
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  height: 80vh;
  align-items: center;
  justify-content: center;
}
</style>
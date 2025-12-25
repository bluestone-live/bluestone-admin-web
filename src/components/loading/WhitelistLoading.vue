<template>
  <div class="loading-spinner">
    <trinity-rings-spinner
      :animation-duration="2000"
      :size="100"
      :color="'#6F92DA'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { TrinityRingsSpinner } from "epic-spinners";
export default defineComponent({
  name: "WhitelistLoading",
  components: {
    TrinityRingsSpinner,
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
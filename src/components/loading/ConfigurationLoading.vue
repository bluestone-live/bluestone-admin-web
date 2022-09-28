<template>
  <div class="loading-spinner">
    <fingerprint-spinner
      :animation-duration="1000"
      :size="300"
      :color="'#6F92DA'"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { FingerprintSpinner } from "epic-spinners";
export default defineComponent({
  name: "ConfigurationLoading",
  components: {
    FingerprintSpinner,
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
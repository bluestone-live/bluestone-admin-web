<template>
  <Suspense>
    <template #fallback>
      <whitelist-loading />
    </template>
    <lender-whitelist />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WhitelistLoading from "@/components/loading/WhitelistLoading.vue";
import LenderWhitelist from "./LenderWhitelist.vue"

export default defineComponent({
  name: "Lender",
  components: {
    WhitelistLoading,
    LenderWhitelist
  },
});
</script>

<style lang="scss">
</style>
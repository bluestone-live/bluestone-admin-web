<template>
  <Suspense>
    <template #fallback>
      <whitelist-loading />
    </template>
    <borrower-whitelist />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import WhitelistLoading from "@/components/loading/WhitelistLoading.vue";
import BorrowerWhitelist from "./BorrowerWhitelist.vue"

export default defineComponent({
  name: "Borrower",
  components: {
    WhitelistLoading,
    BorrowerWhitelist
  }
});
</script>

<style lang="scss">
</style>
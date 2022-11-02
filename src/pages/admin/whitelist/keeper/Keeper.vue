<template>
  <Suspense>
    <template #fallback>
      <whitelist-loading />
    </template>
    <keeper-whitelist />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WhitelistLoading from "@/components/loading/WhitelistLoading.vue";
import KeeperWhitelist from "./KeeperWhitelist.vue"

export default defineComponent({
  name: "Keeper",
  components: {
    WhitelistLoading,
    KeeperWhitelist
  },
});
</script>

<style lang="scss">
</style>
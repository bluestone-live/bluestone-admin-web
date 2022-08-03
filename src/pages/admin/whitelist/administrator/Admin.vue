<template>
  <Suspense>
    <template #fallback>
      <whitelist-loading />
    </template>
    <admin-whitelist />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import WhitelistLoading from "@/components/loading/WhitelistLoading.vue";
import AdminWhitelist from "./AdminWhitelist.vue"

export default defineComponent({
  name: "Admin",
  components: {
    WhitelistLoading,
    AdminWhitelist
  }
});
</script>

<style lang="scss">
</style>
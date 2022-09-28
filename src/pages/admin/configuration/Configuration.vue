<template>
    <Suspense>
      <template #fallback>
        <configuration-loading />
      </template>
      <configuration-detail />
    </Suspense>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ConfigurationDetail from "./ConfigurationDetail.vue";
import ConfigurationLoading from "@/components/loading/ConfigurationLoading.vue"

export default defineComponent({
  name: "Configuration",
  components: {
    ConfigurationDetail,
    ConfigurationLoading,
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
</style>
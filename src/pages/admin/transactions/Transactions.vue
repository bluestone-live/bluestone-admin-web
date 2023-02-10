<template>
    <Suspense>
      <template #fallback>
        <transactions-loading />
      </template>
      <transactions-detail />
    </Suspense>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TransactionsDetail from "./TransactionsDetail.vue";
import TransactionsLoading from "@/components/loading/TransactionsLoading.vue"

export default defineComponent({
  name: "Transactions",
  components: {
    TransactionsDetail,
    TransactionsLoading,
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
</style>
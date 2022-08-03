<template>
  <Suspense>
    <!-- <h1>LoanList</h1>     -->
    <template #fallback>
      <loan-list-loading />
    </template>
      <loan-list-cards />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LoanListCards from "./LoanListCards.vue";
import LoanListLoading from "@/components/loading/LoanListLoading.vue"

export default defineComponent({
  name: "LoanList",
  components: {
    LoanListCards,
    LoanListLoading
  },
});
</script>

<style lang="scss">
</style>
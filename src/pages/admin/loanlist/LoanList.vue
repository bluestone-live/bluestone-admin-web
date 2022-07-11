<template>
  <Suspense>
    <!-- <h1>LoanList</h1>     -->
    <template #fallback>
      <h1>LOADING</h1>
    </template>
      <loan-list-cards />
  </Suspense>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LoanListCards from "./LoanListCards.vue";

export default defineComponent({
  name: "LoanList",
  components: {
    LoanListCards,
  },
});
</script>

<style lang="scss">
</style>
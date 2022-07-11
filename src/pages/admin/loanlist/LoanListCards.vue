<template>
  <div class="row row-equal">
    <!-- <div class="flex xs12 md12 xl12">
      <div class="row"> -->
    <div class="flex xs12 sm6" v-for="(loanDetail, borrowersIdx) in loanRecords" :key="borrowersIdx">
      <va-card class="mb-4">
        <va-card-title>
          <h1>{{ loanDetail[0] }}</h1>
        </va-card-title>
        <va-card-content>
          <va-accordion v-model="loanDetail[1]" popout>
            <va-collapse
              v-for="(loanRecord, index) in loanDetail[1]"
              :key="index"
              class="mb-4"
              :header="formatTimestamp(loanRecord.createdAt) + ' ~ ' + formatTimestamp(loanRecord.dueAt)"
              :color="loanRecord.isClosed?'gray':'success'"
            >
              <div class="pa-3">
                <p class="display-3">LOANED: {{ loanRecord.loanAmount }}</p>
                <div>
                    Already Paid Amount: {{loanRecord.alreadyPaidAmount}}
                </div>
              </div>
            </va-collapse>
          </va-accordion>
        </va-card-content>
      </va-card>
    </div>
    <!-- </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useGlobalConfig } from "vuestic-ui";
import { useLoanStore } from "@/store/Loan";
import utils from "@/utils"
// import { useDepositStore } from "@/store/Deposit";

export default defineComponent({
  name: "LoanListCards",
  async setup() {
    const loanStore = useLoanStore();
    // const depositStore = useDepositStore();

    await loanStore.init();
    // await depositStore.init();

    const loanRecords = loanStore.getHandledLoanRecords;
    console.log("loanRecords=", loanRecords);

    const theme = computed(() => {
      return useGlobalConfig().getGlobalConfig().colors || {};
    });

    const formatTimestamp = utils.formatTimestamp
    return {
      loanRecords,
      formatTimestamp
    };
  },
});
</script>

<style lang="scss" scoped>
.row-separated {
  .flex + .flex {
    border-left: 1px solid var(--va-background);
  }

  // @include media-breakpoint-down(xs) {
  //   p:not(.display-2) {
  //     font-size: 0.875rem;
  //   }
  // }
}

.rich-theme-card-text {
  line-height: 24px;
}

.dashboard {
  .va-card__header--over {
    // @include media-breakpoint-up(md) {
    //   padding-top: 0 !important;
    // }
  }

  .va-card__image {
    // @include media-breakpoint-up(md) {
    //   padding-bottom: 0 !important;
    // }
  }
  // .image-card {
  //   position: relative;
  //   .va-button {
  //     position: absolute;
  //   }
  // }
}
</style>

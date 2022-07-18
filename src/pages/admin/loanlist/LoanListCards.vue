<template>
  <div class="row row-equal">
    <div
      class="flex xs12 sm12"
      v-for="(loanDetail, borrowersIdx) in loanRecords"
      :key="borrowersIdx"
    >
      <va-card class="mb-4">
        <va-card-title class="flex">
          <h1>
            <va-icon class="mr-1" name="user" size="small" />
            {{ loanDetail[0] }}
          </h1>
          <div class="text-right">
            <va-badge
              size="small"
              :color="
                whitelist.indexOf(loanDetail[0]) >= 0 ? 'success' : 'danger'
              "
              :text="
                whitelist.indexOf(loanDetail[0]) >= 0
                  ? 'On Whitelist'
                  : 'Out Whitelist'
              "
            ></va-badge>
          </div>
        </va-card-title>
        <va-card-content>
          <va-collapse
            v-for="(loanRecord, index) in loanDetail[1]"
            :key="index"
            class="mb-4"
            :header="
              formatTimestamp(loanRecord.createdAt) +
              ' ~ ' +
              formatTimestamp(loanRecord.dueAt)
            "
            :color="getCollapseColor(loanRecord)"
            color-all
            icon="timer"
          >
            <va-list>
              <va-list-label>
                <h1>{{ $t("loanList.loanDetailTitle") }}</h1>
              </va-list-label>
              <span>
                <va-button
                  class="mr-4 mb-2"
                  :disabled="!loanRecord.isMarginCall"
                  color="warning"
                  >Margin Call</va-button
                >
                <va-button
                  class="mr-4 mb-2"
                  :disabled="!loanRecord.isLiquidable"
                  color="danger"
                  >Liquidate</va-button
                >
              </span>
              <va-divider />
              <va-list-item
                v-for="(valueRecord, keyRecord) in loanRecord"
                :key="keyRecord"
              >
                <va-list-item-section>
                  <va-list-item-label>
                    {{ keyRecord }}
                  </va-list-item-label>

                  <va-list-item-label caption>
                    {{ valueRecord }}
                  </va-list-item-label>
                </va-list-item-section>
              </va-list-item>
            </va-list>
          </va-collapse>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useGlobalConfig } from "vuestic-ui";
import { useLoanStore } from "@/store/Loan";
import utils from "@/utils";

export default defineComponent({
  name: "LoanListCards",
  async setup() {
    const loanStore = useLoanStore();
    await loanStore.init();

    const loanRecords = loanStore.getHandledLoanRecords;
    console.log("loanRecords=", loanRecords);

    const whitelist = loanStore.getWhitelist;

    function getCollapseColor(loanDetail: any) {
      if (loanDetail.isClosed) {
        return "gray";
      } else {
        if (loanDetail.isLiquidable) {
          return "danger";
        } else if (loanDetail.isMarginCall) {
          return "warning";
        } else {
          return "background";
        }
      }
    }

    async function liquidateLoan() {
      
    }

    // const columns = [
    //   { key: "isClosed" },
    //   { key: "loanId" },
    //   { key: "loanTokenAddress" },
    //   { key: "collateralTokenAddress" },
    //   { key: "loanAmount" },
    //   { key: "collateralAmount" },
    //   { key: "loanTerm" },
    //   { key: "annualInterestRate" },
    //   { key: "interest" },
    //   { key: "collateralCoverageRatio" },
    //   { key: "minCollateralCoverageRatio" },
    //   { key: "alreadyPaidAmount" },
    //   { key: "liquidatedAmount" },
    //   { key: "soldCollateralAmount" },
    //   { key: "createdAt" },
    //   { key: "dueAt" },
    //   { key: "remainingDebt" },
    //   { key: "isMarginCall" },
    //   { key: "isLiquidable" },
    // ];

    // const columns = [{ key: "key" }, { key: "value" }];

    const theme = computed(() => {
      return useGlobalConfig().getGlobalConfig().colors || {};
    });

    const formatTimestamp = utils.formatTimestamp;
    return {
      theme,
      // columns,
      whitelist,
      loanRecords,
      formatTimestamp,
      getCollapseColor,
      collapseControl: false,
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
  .text-right {
    text-align: right;
  }
}
</style>

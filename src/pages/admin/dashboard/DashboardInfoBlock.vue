<template>
  <div class="row row-equal">
    <div
      class="flex xs12 sm6"
      v-for="(info, idx) in state.priceInfoTiles"
      :key="idx"
    >
      <va-card
        class="mb-4"
        square
        outlined
        stripe
        stripe-color="success"
        :color="info.color"
      >
        <va-card-title>{{ info.title }}</va-card-title>
        <va-card-content>
          <p class="display-2 mb-0" style="color: #545454">
            {{ info.price + " $" }}
          </p>
        </va-card-content>
      </va-card>
    </div>

    <div
      class="flex xs12 sm6"
      v-for="(info, idx) in state.balanceInfoTiles"
      :key="idx"
    >
      <va-card class="mb-4" :color="info.color" gradient>
        <va-card-title>{{ info.title }}</va-card-title>
        <va-card-content>
          <p class="display-2 mb-0" style="color: white">
            {{ info.balance + " " + $t("dashboard.info." + info.text) }}
          </p>
          <p style="color: white">
            {{ info.price + " $" }}
          </p>
        </va-card-content>
      </va-card>
    </div>

    <div class="flex xs12 md12">
      <va-card>
        <va-card-title>{{ $t("dashboard.loans.title") }}</va-card-title>
        <va-card-content>
          <div class="row row-separated">
            <div
              class="flex xs3"
              v-for="(info, idx) in state.statusInfoTiles"
              :key="idx"
            >
              <p
                class="display-2 mb-1 text--center"
                :style="{ color: info.color }"
              >
                {{ info.value }}
              </p>
              <p class="text--center mb-1">
                {{ $t("dashboard.info." + info.text) }}
              </p>
            </div>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <div class="flex xs12 md12 xl12">
      <va-card class="d-flex">
        <va-card-title>
          <h1>{{ $t("dashboard.pools.title") }}</h1>
        </va-card-title>
        <va-card-content>
          <va-data-table
            :items="state.availableSgcPools"
            :columns="state.columns"
          >
            <template #colgroup>
              <col span="5" />
              <col class="table-example--slots" />
            </template>
          </va-data-table>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useLoanStore } from "@/store/Loan";
import { useDepositStore } from "@/store/Deposit";
import { useOracleStore } from "@/store/Oracle";
import { useDashboard } from "@/services/dashboard";

export default defineComponent({
  name: "DashboardInfoBlock",
  async setup() {
    const loanStore = useLoanStore();
    const depositStore = useDepositStore();
    const oracleStore = useOracleStore();
    if (!loanStore.isInited) {
      await loanStore.init();
    }
    if (!depositStore.isInited) {
      await depositStore.init();
    }
    if (!oracleStore.isInited) {
      await oracleStore.init();
    }

    let { state } = useDashboard(loanStore, depositStore, oracleStore);

    return {
      state,
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
  color: rgb(133, 133, 133);
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

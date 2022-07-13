<template>
  <div class="row row-equal">
    <!-- <div class="flex xl12 xs12">
      <div class="row"> -->
    <div
      class="flex xs12 sm6"
      v-for="(info, idx) in balanceInfoTiles"
      :key="idx"
    >
      <va-card class="mb-4" :color="info.color">
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
        <va-card-title>Loans Status</va-card-title>
        <va-card-content>
          <div class="row row-separated">
            <div
              class="flex xs3"
              v-for="(info, idx) in statusInfoTiles"
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
    <!-- </div>
    </div> -->

    <div class="flex xs12 md12 xl12">
      <va-card class="d-flex">
        <va-card-title>
          <h1>{{ $t("dashboard.pools.title") }}</h1>
        </va-card-title>
        <va-card-content>
          <va-data-table :items="items" :columns="columns">
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
import { computed, defineComponent } from "vue";
import { useGlobalConfig } from "vuestic-ui";
import { useLoanStore } from "@/store/Loan";
import { useDepositStore } from "@/store/Deposit";
import { useOracleStore } from "@/store/Oracle";

export default defineComponent({
  name: "DashboardInfoBlock",
  async setup() {
    const loanStore = useLoanStore();
    const depositStore = useDepositStore();
    const oracleStore = useOracleStore();

    await loanStore.init();
    await depositStore.init();
    await oracleStore.init();
    const btcBalance = loanStore.getBtcBalance;
    const ethBalance = loanStore.getEthBalance;
    const activeLoans = loanStore.getActiveLoansCount;
    const totalLoans = loanStore.getTotalLoansCount;
    const marginCall = loanStore.getMarginCallLoansCount;
    const liquidable = loanStore.getLiquidatedLoansCount;
    const sgcBalance = depositStore.getSgcBalance;
    const users = depositStore.getAvailableSgcPools;
    const totalLoanOutstandingBalance =
      depositStore.getTotalLoanOutstandingBalance;
    const btcPrice = oracleStore.getBtcPrice;
    const ethPrice = oracleStore.getEthPrice;
    const sgcPrice = oracleStore.getSgcPrice;

    const columns = [
      { key: "poolId" },
      { key: "availableAmount" },
      { key: "depositAmount" },
      { key: "loanInterest" },
      { key: "totalDepositWeight" },
    ];

    const balanceInfoTiles = [
      {
        color: "info",
        balance: btcBalance,
        price: btcPrice * btcBalance,
        title: "BTC Balance",
        text: "btc",
        icon: "",
      },
      {
        color: "info",
        balance: ethBalance,
        price: ethPrice * ethBalance,
        title: "ETH Balance",
        text: "eth",
        icon: "",
      },
      {
        color: "danger",
        balance: sgcBalance,
        price: sgcPrice * sgcBalance,
        title: "SGC Balance",
        text: "sgc",
        icon: "",
      },
      {
        color: "secondary",
        balance: totalLoanOutstandingBalance,
        price: sgcPrice * totalLoanOutstandingBalance,
        title: "Total Loan Outstanding Balance",
        text: "sgc",
        icon: "",
      },
    ];

    const statusInfoTiles = [
      {
        color: "#3d9209",
        value: activeLoans,
        text: "activeLoans",
      },
      {
        color: "#2c82e0",
        value: totalLoans,
        text: "totalLoans",
      },
      {
        color: "#ffd43a",
        value: marginCall,
        text: "marginCall",
      },
      {
        color: "#e42222",
        value: liquidable,
        text: "liquidable",
      },
    ];

    const theme = computed(() => {
      return useGlobalConfig().getGlobalConfig().colors || {};
    });
    return {
      balanceInfoTiles,
      statusInfoTiles,
      theme,
      items: users,
      columns,
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

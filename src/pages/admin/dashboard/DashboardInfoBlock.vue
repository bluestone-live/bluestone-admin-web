<template>
  <div class="row row-equal">
    <div
      class="flex xs12 sm6"
      v-for="(info, idx) in priceInfoTiles"
      :key="idx"
    >
      <va-card class="mb-4" square outlined stripe stripe-color="success" :color="info.color">
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
      v-for="(info, idx) in balanceInfoTiles"
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
        <va-card-title>{{ $t("dashboard.pools.title") }}</va-card-title>
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
import { BigNumber } from "ethers";
import utils from "@/utils";

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

    let btcPrice = oracleStore.getBtcPrice;
    let ethPrice = oracleStore.getEthPrice;
    let activeLoansCount = loanStore.activeLoansCount;
    let totalLoansCount = loanStore.totalLoansCount;
    let marginCallCount = loanStore.marginCallLoansCount;
    let liquidableCount = loanStore.liquidableLoansCount;
    let sgcBalance = depositStore.getSgcBalance;
    let availableSgcPools = filterAvailableSgcPools(depositStore.sgcPools);
    let totalLoanOutstandingBalance =
      depositStore.getTotalLoanOutstandingBalance;
    let sgcPrice = oracleStore.getSgcPrice;

    const columns = [
      { key: "poolId" },
      { key: "availableAmount" },
      { key: "depositAmount" },
      { key: "loanInterest" },
      { key: "totalDepositWeight" },
      { key: "dueDate" },
    ];

    let priceInfoTiles = [
      {
        price: btcPrice,
        title: "xBTC/USD",
        text: "update per hour",
        icon: "",
      },
      {
        price: ethPrice,
        title: "ETH/USD",
        text: "ETH/USD",
        icon: "",
      },
    ]

    let balanceInfoTiles = [
      {
        color: "danger",
        balance: sgcBalance,
        price: sgcPrice * (sgcBalance as number),
        title: "SGC Balance",
        text: "sgc",
        icon: "",
      },
      {
        color: "secondary",
        balance: totalLoanOutstandingBalance,
        price: sgcPrice * (totalLoanOutstandingBalance as number),
        title: "Total Loan Outstanding Balance",
        text: "sgc",
        icon: "",
      },
    ];

    const statusInfoTiles = [
      {
        color: "#3d9209",
        value: activeLoansCount,
        text: "activeLoans",
      },
      {
        color: "#2c82e0",
        value: totalLoansCount,
        text: "totalLoans",
      },
      {
        color: "#ffd43a",
        value: marginCallCount,
        text: "marginCall",
      },
      {
        color: "#e42222",
        value: liquidableCount,
        text: "liquidable",
      },
    ];

    function filterAvailableSgcPools(sgcPools: any) {
      let tempArr: any[] = [];
      sgcPools.forEach((pool: any) => {
        if (pool.availableAmount.gt(BigNumber.from(0))) {
          tempArr.push({
            poolId: pool.poolId.toNumber(),
            availableAmount:
              pool.availableAmount.mul(10000).div(depositStore.exp).toNumber() /
                10000 +
              " SGC",
            depositAmount:
              pool.depositAmount.mul(10000).div(depositStore.exp).toNumber() /
                10000 +
              " SGC",
            loanInterest:
              pool.loanInterest.mul(10000).div(depositStore.exp).toNumber() /
                10000 +
              " SGC",
            totalDepositWeight:
              pool.totalDepositWeight.div(depositStore.exp).toNumber() +
              " SGC·Days",
            dueDate: utils.formatTimestamp(pool.poolId.mul(86400).toNumber()),
          });
        }
      });
      return tempArr;
    }

    const theme = computed(() => {
      return useGlobalConfig().getGlobalConfig().colors || {};
    });

    return {
      priceInfoTiles,
      balanceInfoTiles,
      statusInfoTiles,
      theme,
      items: availableSgcPools,
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

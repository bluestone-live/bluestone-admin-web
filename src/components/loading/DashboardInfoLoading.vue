<template>
  <div class="row row-equal">
    <div class="flex xl12 xs12">
      <div class="row">
        <div
          class="flex xs12 sm4"
          v-for="(info, idx) in balanceInfoTiles"
          :key="idx"
        >
          <va-inner-loading loading>
            <va-card class="mb-4" :color="info.color" gradient>
              <va-card-content>
                <p class="display-2 mb-0" style="color: white">
                  {{ info.value }}
                </p>
                <p style="color: white">
                  {{ $t("dashboard.info." + info.text) }}
                </p>
              </va-card-content>
            </va-card>
          </va-inner-loading>
        </div>

        <div class="flex xs12 md8">
          <va-inner-loading loading>
            <va-card>
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
          </va-inner-loading>
        </div>
      </div>
    </div>

    <div class="flex xs12 md12 xl12">
      <va-inner-loading loading>
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
      </va-inner-loading>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useGlobalConfig } from "vuestic-ui";

export default defineComponent({
  name: "DashboardInfoLoading",
  setup() {
    const btcBalance = 0;
    const ethBalance = 0;
    const sgcBalance = 0;
    const totalLoanOutstandingBalance = 0;
    const activeLoans = 0;
    const totalLoans = 0;
    const marginCall = 0;
    const liquidable = 0;

    const balanceInfoTiles = [
      {
        color: "primary",
        value: btcBalance,
        text: "btc",
        icon: "",
      },
      {
        color: "primary",
        value: ethBalance,
        text: "eth",
        icon: "",
      },
      {
        color: "danger",
        value: sgcBalance,
        text: "sgc",
        icon: "",
      },
      {
        color: "secondary",
        value: totalLoanOutstandingBalance,
        text: "totalLoanOutstandingBalance",
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

    const users: any = [];
    const columns = [
      { key: "poolId" },
      { key: "availableAmount" },
      { key: "depositAmount" },
      { key: "loanInterest" },
      { key: "totalDepositWeight" },
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

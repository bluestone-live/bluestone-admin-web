<template>
  <div class="row row-equal">
    <div class="flex xs12 sm12">
      <va-card class="mb-4">
        <va-card-title>Interst Model</va-card-title>
        <va-card-content>
          <va-card stripe stripe-color="success" class="mb-4">
            <va-card-title>Current Interest Model</va-card-title>
            <va-card-content>
              <div id="interest-model-chart"></div>
            </va-card-content>
          </va-card>

          <va-card v-if="false" stripe stripe-color="warning">
            <va-card-title>Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="gatewayAddressInProposal"
                label="Gateway Address"
                readonly
              />
              <va-list class="data-list">
                <va-list-label> Administrators Voting </va-list-label>

                <va-list-item
                  v-for="(administrator, index) in administrators"
                  :key="index"
                >
                  <va-list-item-section avatar>
                    <va-avatar
                      :color="index === 0 ? 'dark' : 'info'"
                      :icon="index === 0 ? 'settings' : 'manage_accounts'"
                      size="small"
                    />
                  </va-list-item-section>

                  <va-list-item-section>
                    <va-list-item-label>
                      {{ administrator }}
                    </va-list-item-label>
                  </va-list-item-section>

                  <va-list-item-section icon>
                    <va-chip
                      square
                      outline
                      size="small"
                      color="success"
                      icon="verified"
                      >Approved</va-chip
                    >
                  </va-list-item-section>
                </va-list-item>
              </va-list>
            </va-card-content>

            <va-card-actions align="between">
              <va-button color="success">Approve</va-button>
              <va-button color="danger">Reject</va-button>
            </va-card-actions>
          </va-card>
          <va-button
            @click="openAddInterestModel = !openAddInterestModel"
            :icon="openAddInterestModel ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ openAddInterestModel ? "Clear" : "Create" }}</va-button
          >
          <va-card v-if="openAddInterestModel">
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="newAdministratorAddress"
                label="Loan Term"
                :placeholder="loanParams.termList"
                :disabled="isAddLoading"
              />
              <va-input
                class="mb-4"
                v-model="newAdministratorAddress"
                label="Loan Interest"
                :placeholder="loanParams.interestList"
                :disabled="isAddLoading"
              />
              <va-button color="primary">Submit</va-button>
            </va-card-content>
          </va-card>
        </va-card-content>
      </va-card>
    </div>

    <div class="flex xs12 sm6">
      <va-card class="mb-4">
        <va-card-title>Gateway</va-card-title>
        <va-card-content>
          <va-card stripe stripe-color="success" class="mb-4">
            <va-card-title>Current Address</va-card-title>
            <va-card-content>
              <!-- <h1>{{ gatewayAddressInProposal }}</h1> -->
              <va-input
                class="mb-4"
                v-model="currentGatewayAddress"
                success
                readonly
              />
            </va-card-content>
          </va-card>

          <va-card stripe stripe-color="warning">
            <va-card-title>Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="gatewayAddressInProposal"
                label="Gateway Address"
                readonly
              />
              <va-list class="data-list">
                <va-list-label> Administrators Voting </va-list-label>

                <va-list-item
                  v-for="(administrator, index) in administrators"
                  :key="index"
                >
                  <va-list-item-section avatar>
                    <va-avatar
                      :color="index === 0 ? 'dark' : 'info'"
                      :icon="index === 0 ? 'settings' : 'manage_accounts'"
                      size="small"
                    />
                  </va-list-item-section>

                  <va-list-item-section>
                    <va-list-item-label>
                      {{ administrator }}
                    </va-list-item-label>
                  </va-list-item-section>

                  <va-list-item-section icon>
                    <va-chip
                      square
                      outline
                      size="small"
                      color="success"
                      icon="verified"
                      >Approved</va-chip
                    >
                  </va-list-item-section>
                </va-list-item>
              </va-list>
            </va-card-content>

            <va-card-actions align="between">
              <va-button color="success">Approve</va-button>
              <va-button color="danger">Reject</va-button>
            </va-card-actions>
          </va-card>
          <va-button
            @click="openAddGatewayAddress = !openAddGatewayAddress"
            :icon="openAddGatewayAddress ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ openAddGatewayAddress ? "Clear" : "Create" }}</va-button
          >
          <va-card v-if="openAddGatewayAddress">
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="newAdministratorAddress"
                label="Gateway Address"
                placeholder="0x..."
                :disabled="isAddLoading"
              />
              <va-button color="primary">Submit</va-button>
            </va-card-content>
          </va-card>
        </va-card-content>
      </va-card>
    </div>

    <div class="flex xs12 sm6">
      <va-card class="mb-4">
        <va-card-title>Minimum Collateral Coverage Ratio</va-card-title>
        <va-card-content>
          <va-card stripe stripe-color="success" class="mb-4">
            <va-card-title>Current Min-CCR</va-card-title>
            <va-card-content>
              <va-input class="mb-4" v-model="currentMinCCR" success readonly>
                <template #appendInner>
                  <span>%</span>
                </template>
              </va-input>
            </va-card-content>
          </va-card>

          <va-card stripe stripe-color="warning">
            <va-card-title>Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="minCCRInProposal"
                label="Min-CCR"
                readonly
              >
                <template #appendInner>
                  <span>%</span>
                </template>
              </va-input>
              <va-list class="data-list">
                <va-list-label> Administrators Voting </va-list-label>

                <va-list-item
                  v-for="(administrator, index) in administrators"
                  :key="index"
                >
                  <va-list-item-section avatar>
                    <va-avatar
                      :color="index === 0 ? 'dark' : 'info'"
                      :icon="index === 0 ? 'settings' : 'manage_accounts'"
                      size="small"
                    />
                  </va-list-item-section>

                  <va-list-item-section>
                    <va-list-item-label>
                      {{ administrator }}
                    </va-list-item-label>
                  </va-list-item-section>

                  <va-list-item-section icon>
                    <va-chip
                      square
                      outline
                      size="small"
                      color="success"
                      icon="verified"
                      >Approved</va-chip
                    >
                  </va-list-item-section>
                </va-list-item>
              </va-list>
            </va-card-content>

            <va-card-actions align="between">
              <va-button color="success">Approve</va-button>
              <va-button color="danger">Reject</va-button>
            </va-card-actions>
          </va-card>
          <va-button
            @click="openSetMinCCR = !openSetMinCCR"
            :icon="openSetMinCCR ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ openSetMinCCR ? "Clear" : "Create" }}</va-button
          >
          <va-card v-if="openSetMinCCR">
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="newAdministratorAddress"
                label="Min-CCR"
                placeholder="100"
                :disabled="isAddLoading"
              >
                <template #appendInner>
                  <span>%</span>
                </template>
              </va-input>
              <va-button color="primary">Submit</va-button>
            </va-card-content>
          </va-card>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance, onMounted } from "vue";
import { useCommonStore } from "@/store/Common";
import { useAccountStore } from "@/store/Account";
import { useWhitelistStore } from "@/store/Whitelist";
import { usePendingStore } from "@/store/Pending";
import * as echarts from "echarts";
import utils from "@/utils";

export default defineComponent({
  name: "ConfigurationDetail",
  components: {},
  async setup(props, ctx) {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const loanParams = {
      termList: [1, 30, 60, 120, 240],
      interestList: [6.5, 8, 10, 11, 13.5],
    };

    onMounted(() => {
      const daysInYear = Array.from({ length: 365 }, (_, i) => i + 1);
      const sgcInterest = [];
      let paramIndex = 0;
      for (let term of daysInYear) {
        if (term >= loanParams.termList[paramIndex]) {
          if (paramIndex < loanParams.termList.length - 1 && term == loanParams.termList[paramIndex + 1]) {
            paramIndex++;
          }
          sgcInterest.push(loanParams.interestList[paramIndex]);
        }
      }
      const chartDom = document.getElementById("interest-model-chart");
      const myChart = echarts.init(chartDom!);
      const option = {
        title: {
          text: "Loan Inerest(%)",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["SGC", "Step Middle", "Step End"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          data: daysInYear,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "SGC",
            type: "line",
            step: "start",
            data: sgcInterest,
          },
        ],
      };
      myChart.setOption(option);
    });

    const commonStore = useCommonStore();
    const accountStore = useAccountStore();
    const pendingStore = usePendingStore();
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.isInited) {
      await whitelistStore.init();
    }

    let openAddGatewayAddress = ref(false);
    let openAddInterestModel = ref(false);
    let openSetMinCCR = ref(false);

    const currentGatewayAddress = "0x9489f551e2dd40aA69518D2502Fe394212A0020D";
    const gatewayAddressInProposal =
      "0x13a6D1fe418de7e5B03Fb4a15352DfeA3249eAA4";
    const currentMinCCR = 150;
    const minCCRInProposal = 130;

    const openNotification = (message: string, color: string) => {
      _this?.$vaToast.init({
        message: message,
        color: color,
        iconClass: "fa-star-o",
        position: "bottom-right",
        duration: Number(10000),
        title: "Configuration",
        fullWidth: false,
      });
    };

    return {
      loanParams,
      currentGatewayAddress,
      gatewayAddressInProposal,
      currentMinCCR,
      minCCRInProposal,
      openAddGatewayAddress,
      openAddInterestModel,
      openSetMinCCR,
      administrators: whitelistStore.administrators,
    };
  },
});
</script>

<style lang="scss">
.data-list {
  border: 1px gainsboro solid;
  border-radius: 0.3rem;
  padding: 0;
}

#interest-model-chart {
  height: 300px;
  width: 100%;
}
</style>
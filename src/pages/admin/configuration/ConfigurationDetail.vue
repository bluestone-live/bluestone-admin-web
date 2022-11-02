<template>
  <div class="row row-equal">
    <div class="flex xs12 sm12">
      <va-card class="mb-4">
        <va-card-title>Interest Rate Model</va-card-title>
        <va-card-content>
          <va-card stripe stripe-color="success" class="mb-4">
            <va-card-title>Current Interest Rate Model</va-card-title>
            <va-card-content>
              <div id="interest-model-chart"></div>
            </va-card-content>
          </va-card>

          <va-button
            @click="
              state.openSetInterestRateModel = !state.openSetInterestRateModel
            "
            :icon="state.openSetInterestRateModel ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{
              state.openSetInterestRateModel ? "Clear" : "Create"
            }}</va-button
          >
          <va-card
            v-if="state.openSetInterestRateModel"
            :disabled="!state.isOwner"
          >
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.inputTermList"
                label="Loan Term"
                :placeholder="state.currentInterestRateParams.termList"
                :disabled="state.isSetInterestRateModelLoading"
              >
                <template #appendInner>
                  <va-button
                    size="small"
                    color="info"
                    @click="
                      state.inputTermList =
                        state.currentInterestRateParams.termList
                    "
                  >
                    Current
                  </va-button>
                </template>
              </va-input>
              <va-input
                class="mb-4"
                v-model="state.inputInterestRateList"
                label="Loan Interest Rate"
                :placeholder="state.currentInterestRateParams.interestRateList"
                :disabled="state.isSetInterestRateModelLoading"
              >
                <template #appendInner>
                  <va-button
                    size="small"
                    color="info"
                    @click="
                      state.inputInterestRateList =
                        state.currentInterestRateParams.interestRateList
                    "
                  >
                    Current
                  </va-button>
                </template>
              </va-input>
              <va-button
                color="primary"
                @click="setInterestRates"
                :loading="state.isSetInterestRateModelLoading"
                >Submit</va-button
              >
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
              <va-input
                class="mb-4"
                v-model="state.currentGatewayAddress"
                success
                readonly
              />
            </va-card-content>
          </va-card>

          <!-- <va-card stripe stripe-color="warning">
            <va-card-title>Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.gatewayAddressInProposal"
                label="Gateway Address"
                readonly
              />
              <va-list class="data-list">
                <va-list-label> Administrators Voting </va-list-label>

                <va-list-item
                  v-for="(administrator, index) in state.administrators"
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
          </va-card> -->
          <va-button
            @click="state.openSetGatewayAddress = !state.openSetGatewayAddress"
            :icon="state.openSetGatewayAddress ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ state.openSetGatewayAddress ? "Clear" : "Create" }}</va-button
          >
          <va-card
            v-if="state.openSetGatewayAddress"
            :disabled="!state.isOwner"
          >
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.inputGatewayAddress"
                label="Gateway Address"
                placeholder="0x..."
                :disabled="state.isSetGatewayAddressLoading"
              />
              <va-button
                color="primary"
                @click="setGatewayAddress"
                :loading="state.isSetGatewayAddressLoading"
                >Submit</va-button
              >
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
            <va-card-title>Current Min Collateral Coverage Ratio</va-card-title>
            <va-card-content
              style="display: flex; justify-content: space-between"
            >
              <va-input
                style="width: 48%"
                class="mb-4"
                label="ETH - SGC"
                v-model="state.currentMinCollateralCoverageRatio.ETH"
                success
                readonly
              >
                <template #appendInner>
                  <span>%</span>
                </template>
              </va-input>
              <va-input
                style="width: 48%"
                class="mb-4"
                label="xBTC - SGC"
                v-model="state.currentMinCollateralCoverageRatio.xBTC"
                success
                readonly
              >
                <template #appendInner>
                  <span>%</span>
                </template>
              </va-input>
            </va-card-content>
          </va-card>

          <va-button
            @click="
              state.openSetMinCollateralCoverageRatio =
                !state.openSetMinCollateralCoverageRatio
            "
            :icon="state.openSetMinCollateralCoverageRatio ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{
              state.openSetMinCollateralCoverageRatio ? "Clear" : "Create"
            }}</va-button
          >
          <va-card
            v-if="state.openSetMinCollateralCoverageRatio"
            :disabled="!state.isOwner"
          >
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.inputMinCollateralCoverageRatioOfETH"
                label="ETH - SGC"
                :placeholder="state.currentMinCollateralCoverageRatio.ETH"
                :disabled="state.isSetETHMinCollateralCoverageRatioLoading"
              >
                <template #appendInner>
                  <span>%</span>
                </template>
                <template #append>
                  <va-button
                    color="primary"
                    class="ml-3"
                    @click="setMinCollateralCoverageRatioForETH"
                    :loading="state.isSetETHMinCollateralCoverageRatioLoading"
                    >Submit</va-button
                  >
                </template>
              </va-input>
              <va-input
                class="mb-4"
                v-model="state.inputMinCollateralCoverageRatioOfXBTC"
                label="xBTC - SGC"
                :placeholder="state.currentMinCollateralCoverageRatio.xBTC"
                :disabled="state.isSetXBTCMinCollateralCoverageRatioLoading"
              >
                <template #appendInner>
                  <span>%</span>
                </template>
                <template #append>
                  <va-button
                    color="primary"
                    class="ml-3"
                    @click="setMinCollateralCoverageRatioForXBTC"
                    :loading="state.isSetXBTCMinCollateralCoverageRatioLoading"
                    >Submit</va-button
                  >
                </template>
              </va-input>
              <!-- <va-button
                color="primary"
                @click="setMinCollateralCoverageRatio"
                :loading="state.isSetMinCollateralCoverageRatioLoading"
                >Submit</va-button
              > -->
            </va-card-content>
          </va-card>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from "vue";
import { useCommonStore } from "@/store/Common";
import { useAccountStore } from "@/store/Account";
import { usePendingStore } from "@/store/Pending";
import { useConfiguration } from "@/services/configuration";

export default defineComponent({
  name: "ConfigurationDetail",
  components: {},
  async setup() {
    onMounted(() => {
      initChart();
    });

    const commonStore = useCommonStore();
    const pendingStore = usePendingStore();
    const accountStore = useAccountStore();
    if (!accountStore.isInited) {
      await accountStore.init();
    }
    let {
      state,
      initChart,
      setInterestRates,
      setGatewayAddress,
      setMinCollateralCoverageRatioForETH,
      setMinCollateralCoverageRatioForXBTC
    } = await useConfiguration(commonStore, accountStore, pendingStore);

    watch(
      () => state.chartNeedRefresh,
      (needRefresh) => {
        if (needRefresh) {
          initChart();
          state.chartNeedRefresh = false;
        }
      }
    );

    return {
      state,
      setInterestRates,
      setGatewayAddress,
      setMinCollateralCoverageRatioForETH,
      setMinCollateralCoverageRatioForXBTC
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
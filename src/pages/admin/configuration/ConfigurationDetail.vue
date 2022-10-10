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
          </va-card>
          <va-button
            @click="state.openAddInterestModel = !state.openAddInterestModel"
            :icon="state.openAddInterestModel ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ state.openAddInterestModel ? "Clear" : "Create" }}</va-button
          >
          <va-card v-if="state.openAddInterestModel">
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.newAdministratorAddress"
                label="Loan Term"
                :placeholder="state.loanParams.termList"
                :disabled="isAddLoading"
              />
              <va-input
                class="mb-4"
                v-model="state.newAdministratorAddress"
                label="Loan Interest"
                :placeholder="state.loanParams.interestList"
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
                v-model="state.currentGatewayAddress"
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
          </va-card>
          <va-button
            @click="state.openAddGatewayAddress = !state.openAddGatewayAddress"
            :icon="state.openAddGatewayAddress ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ state.openAddGatewayAddress ? "Clear" : "Create" }}</va-button
          >
          <va-card v-if="state.openAddGatewayAddress">
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.newAdministratorAddress"
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
              <va-input
                class="mb-4"
                v-model="state.currentMinCCR"
                success
                readonly
              >
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
                v-model="state.minCCRInProposal"
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
          </va-card>
          <va-button
            @click="state.openSetMinCCR = !state.openSetMinCCR"
            :icon="state.openSetMinCCR ? 'clear' : 'create'"
            color="primary"
            class="mt-4"
            outline
            >{{ state.openSetMinCCR ? "Clear" : "Create" }}</va-button
          >
          <va-card v-if="state.openSetMinCCR">
            <va-card-title>New Proposal</va-card-title>
            <va-card-content>
              <va-input
                class="mb-4"
                v-model="state.newAdministratorAddress"
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
import { defineComponent, onMounted } from "vue";
import { useCommonStore } from "@/store/Common";
import { useAccountStore } from "@/store/Account";
import { useWhitelistStore } from "@/store/Whitelist";
import { usePendingStore } from "@/store/Pending";
import { useConfiguration } from "@/services/configuration";

export default defineComponent({
  name: "ConfigurationDetail",
  components: {},
  async setup() {
    onMounted(() => {
      const option = initChartOption(
        state.loanParams.termList,
        state.loanParams.interestList
      );
      initChart(option);
    });

    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.isInited) {
      await whitelistStore.init();
    }
    let { state, initChartOption, initChart } =
      useConfiguration(whitelistStore);

    return {
      state,
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
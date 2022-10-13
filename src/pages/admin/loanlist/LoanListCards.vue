<template>
  <div class="row row-equal">
    <va-modal
      v-model="state.showMarginCallModal"
      message="Please contact the borrower to add more collaterals."
      title="Margin Call"
    />
    <va-modal
      v-model="state.showLiquidateModal"
      title="Liquidate Amount"
      hide-default-actions
    >
      <va-card stripe stripe-color="success" class="mb-4 modal-width">
        <va-card-content>
          <div>
            {{
              `Collateral Ratio:
          ${
            state.selectedLoanRecord.collateralCoverageRatio
              .mul(10000)
              .div(state.exp)
              .toNumber() / 100
          }%
            `
            }}
          </div>
        </va-card-content>
      </va-card>
      <va-card>
        <va-card-content>
          <va-input
            v-model="state.inputLiquidateAmount"
            type="text"
            class="mb-4"
            :disabled="state.isLiquidateLoading"
            :rules="[
              (v) =>
                Number(v) > Number(state.minLiquidateAmount) ||
                `Must be greater than 0.`,
              (v) =>
                Number(v) <= Number(state.maxLiquidateAmount) ||
                `Exceeds maximum value.`,
            ]"
          >
            <template #prepend>
              <va-button
                class="mr-2"
                :rounded="false"
                flat
                size="small"
                :disabled="Number(state.safeLiquidateAmount) === 0"
                @click="state.inputLiquidateAmount = state.safeLiquidateAmount"
                >Safe</va-button
              >
            </template>
            <template #append>
              <va-button
                class="ml-2"
                :rounded="false"
                flat
                size="small"
                color="danger"
                @click="state.inputLiquidateAmount = state.maxLiquidateAmount"
                >All</va-button
              >
            </template>
          </va-input>
          <div class="mb-3">
            {{ `Safe Collateral Ratio: ${state.safeCCR}%` }}
          </div>
          <div>
            {{ `Collateral Ratio(Calculation): ${state.liquidatedCCR}%` }}
          </div>
        </va-card-content>
      </va-card>
      <template #footer>
        <va-button
          :loading="state.isLiquidateLoading"
          :disabled="state.inputLiquidateAmount === '' || Number(state.inputLiquidateAmount) <= 0"
          @click="
            liquidateLoan(
              state.selectedLoanRecord.loanId,
              state.inputLiquidateAmount
            )
          "
        >
          Liquidate
        </va-button>
      </template>
    </va-modal>
    <div class="xs12 sm12 loanList-select">
      <va-input
        class="flex md4 mt-1"
        label="Borrower Address"
        placeholder="Filter..."
        v-model="state.borrowerValueForFilter"
      >
        <template #prependInner>
          <va-icon name="search" />
        </template>
      </va-input>
      <va-button-toggle
        flat
        gradient
        v-model="state.toggleValueForFilter"
        :options="state.toggleOptions"
        class="mt-3"
      />
    </div>
    <div
      class="flex xs12 sm12"
      v-for="(loanDetail, borrowersIdx) in state.filteredLoanRecords"
      :key="borrowersIdx"
    >
      <va-card class="mb-4">
        <va-card-title class="flex">
          <h1>
            {{ loanDetail[0] }}
            <va-popover
              class="mr-2 mb-2"
              icon="library_add_check"
              message="Copied"
              trigger="click"
              placement="right"
            >
              <va-icon
                name="content_copy"
                size="0.8rem"
                @click="copyToClipboard(loanDetail[0])"
                color="gray"
              />
            </va-popover>
          </h1>
          <div class="text-right">
            <va-badge
              size="small"
              :color="
                state.whitelistedBorrowers.indexOf(loanDetail[0]) >= 0
                  ? 'success'
                  : 'danger'
              "
              :text="
                state.whitelistedBorrowers.indexOf(loanDetail[0]) >= 0
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
            :header="loanRecord.createdAt + ' ~ ' + loanRecord.dueAt"
            :color="getCollapseColor(loanRecord)"
            icon="timer"
          >
            <va-list>
              <va-list-label>
                <h1>{{ $t("loanList.loanDetailTitle") }}</h1>
              </va-list-label>
              <template
                v-for="(valueRecord, keyRecord, itemIndex) in loanRecord"
                :key="keyRecord"
              >
                <va-list-item>
                  <va-list-item-section avatar>
                    <va-avatar
                      :icon="state.loanRecordsKeyIcon[itemIndex]"
                      size="small"
                    >
                    </va-avatar>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label>
                      {{ formatObjectKey(keyRecord) }}
                    </va-list-item-label>
                  </va-list-item-section>
                  <va-list-item-label style="color: gray">
                    {{ valueRecord }}
                  </va-list-item-label>
                  <va-list-item-section icon>
                    <div
                      v-if="
                        keyRecord == 'loanId' ||
                        keyRecord == 'loanTokenAddress' ||
                        keyRecord == 'collateralTokenAddress'
                      "
                    >
                      <va-popover
                        class="mr-2 mb-2"
                        message="Copied"
                        icon="library_add_check"
                        trigger="click"
                        placement="top"
                        color="primary"
                      >
                        <va-icon
                          name="content_copy"
                          size="1rem"
                          @click="copyToClipboard(valueRecord)"
                          color="gray"
                        />
                      </va-popover>
                    </div>
                    <div v-else>
                      <va-icon name="eye" size="1rem" color="gray" />
                    </div>
                  </va-list-item-section>
                </va-list-item>
                <va-list-separator
                  v-if="itemIndex <= 18"
                  :key="'separator' + keyRecord"
                />
              </template>
              <div class="loanDetail-buttons">
                <span>
                  <va-button
                    class="mr-4 mb-2"
                    :disabled="!loanRecord.isMarginCall"
                    @click="clickMarginCall()"
                    color="warning"
                    >Margin Call</va-button
                  >
                  <va-button
                    class="mr-4 mb-2"
                    :disabled="!loanRecord.isLiquidable"
                    :loading="state.liquidateLoadingMap.get(loanRecord.loanId)"
                    @click="clickLiquidate(loanRecord.loanId)"
                    color="danger"
                    >Liquidate</va-button
                  >
                </span>
              </div>
            </va-list>
          </va-collapse>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts">
import { watch, defineComponent } from "vue";
import { useLoanStore } from "@/store/Loan";
import { useCommonStore } from "@/store/Common";
import { useWhitelistStore } from "@/store/Whitelist";
import { useAccountStore } from "@/store/Account";
import { usePendingStore } from "@/store/Pending";
import { useOracleStore } from "@/store/Oracle";
import { useLoanList } from "@/services/loan-list";
import utils from "@/utils";
import { ethers } from "ethers";

export default defineComponent({
  name: "LoanListCards",
  async setup() {
    const accountStore = useAccountStore();
    const loanStore = useLoanStore();
    const pendingStore = usePendingStore();
    const commonStore = useCommonStore();
    const whitelistStore = useWhitelistStore();
    const oracleStore = useOracleStore();
    if (!commonStore.isInited) {
      await commonStore.init();
    }
    if (!whitelistStore.isInited) {
      await whitelistStore.init();
    }
    if (!loanStore.isInited) {
      await loanStore.init();
    }
    if (!oracleStore.isInited) {
      await oracleStore.init();
    }

    let {
      state,
      clickMarginCall,
      clickLiquidate,
      getCollapseColor,
      filterByInput,
      filterByToggle,
      calcCollateralCoverageRatio,
      liquidateLoan,
      copyToClipboard,
    } = useLoanList(
      commonStore,
      accountStore,
      pendingStore,
      loanStore,
      whitelistStore,
      oracleStore
    );

    watch(
      () => state.borrowerValueForFilter,
      (newValue) => {
        state.filteredLoanRecords = filterByInput(newValue);
      }
    );

    watch(
      () => state.toggleValueForFilter,
      () => {
        state.filteredLoanRecords = filterByToggle();
      }
    );

    watch(
      () => state.inputLiquidateAmount,
      (newValue) => {
        if (utils.isNumber(newValue)) {
          const liquidateAmount = ethers.utils.parseUnits(newValue, "ether");
          try {
            state.liquidatedCCR = calcCollateralCoverageRatio(
              state.selectedLoanRecord,
              liquidateAmount
            );
          } catch (err) {
            state.liquidatedCCR = Infinity;
          }
        }
      }
    );

    return {
      state,
      formatObjectKey: utils.formatObjectKey,
      getCollapseColor,
      clickMarginCall,
      clickLiquidate,
      liquidateLoan,
      copyToClipboard,
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
.modal-width {
  min-width: 400px;
}

.loanList-select {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.loanDetail-buttons {
  display: flex;
  justify-content: right;
  margin-top: 40px;
}
</style>

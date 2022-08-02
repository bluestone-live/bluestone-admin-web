<template>
  <div class="row row-equal">
    <va-modal
      v-model="showModal"
      message="Please contact the borrower to add more collaterals."
      title="Margin Call"
    />
    <div class="xs12 sm12 loanList-select">
      <va-input
        class="flex md4 mt-1"
        label="Borrower Address"
        placeholder="Filter..."
        v-model="filterInput"
      >
        <template #prependInner>
          <va-icon name="search" />
        </template>
      </va-input>
      <va-button-toggle
        flat
        gradient
        v-model="toggleValue"
        :options="toggleOptions"
        class="mt-3"
      />
    </div>
    <div
      class="flex xs12 sm12"
      v-for="(loanDetail, borrowersIdx) in loanRecords"
      :key="borrowersIdx"
    >
      <va-card class="mb-4">
        <va-card-title class="flex">
          <h1>
            <!-- <va-icon class="mr-1" name="user" size="small" /> -->
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
                whitelistedBorrowers.indexOf(loanDetail[0]) >= 0
                  ? 'success'
                  : 'danger'
              "
              :text="
                whitelistedBorrowers.indexOf(loanDetail[0]) >= 0
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
                      :icon="loanRecordsKeyIcon[itemIndex]"
                      size="small"
                    >
                      <!-- <va-icon name="label_outline" size="2rem" color="gray" /> -->
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
                    :loading="marginCallLoadingMap.get(loanRecord.loanId)"
                    @click="marginCall([borrowersIdx, index])"
                    color="warning"
                    >Margin Call</va-button
                  >
                  <va-button
                    class="mr-4 mb-2"
                    :disabled="!loanRecord.isLiquidable"
                    :loading="liquidateLoadingMap.get(loanRecord.loanId)"
                    @click="
                      liquidateLoan(
                        loanRecord.loanId,
                        loanRecord.remainingDebt,
                        index
                      )
                    "
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
import { computed, watch, ref, defineComponent, getCurrentInstance } from "vue";
import { useGlobalConfig } from "vuestic-ui";

import { useLoanStore } from "@/store/Loan";
import { useCommonStore } from "@/store/Common";
import { useWhitelistStore } from "@/store/Whitelist";
import { useAccountStore } from "@/store/Account";
import { usePendingStore } from "@/store/Pending";
import { marginCollateralCoverageRatio } from "@/margin";

import { BigNumber, ethers } from "ethers";
import utils from "@/utils";

export default defineComponent({
  name: "LoanListCards",
  async setup() {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const toggleOptions = [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Margin", value: "marginCall" },
      { label: "Liquidable", value: "liquidable" },
    ];
    let toggleValue = ref("all");

    let showModal = ref(false);

    const commonStore = useCommonStore();
    if (!commonStore.getInitStatus) {
      await commonStore.init();
    }
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.getInitStatus) {
      await whitelistStore.init();
    }
    const accountStore = useAccountStore();
    const pendingStore = usePendingStore();

    const loanStore = useLoanStore();
    await loanStore.init();

    const loanRecordsKeyIcon = [
      "label",
      "label",
      "label",
      "paid",
      "paid",
      "date_range",
      "donut_small",
      "paid",
      "donut_small",
      "donut_small",
      "paid",
      "paid",
      "paid",
      "date_range",
      "date_range",
      "paid",
      "priority_high",
      "priority_high",
      "priority_high",
    ];

    let liquidateLoadingMap = ref(new Map<string, boolean>());
    let marginCallLoadingMap = ref(new Map<string, boolean>());

    const whitelistedBorrowers = whitelistStore.getWhitelistedBorrowers;
    const handledLoanRecords: any = handleRawLoanRecords(
      loanStore.getBorrowersLoanRecords
    );

    let filterInput = ref("");
    let filteredList = ref(handledLoanRecords);

    watch(filterInput, (newValue) => {
      console.log("input changed");
      filterByInput(newValue);
    });

    watch(toggleValue, () => {
      console.log("select changed.");
      filterByToggle();
    });

    function filterByInput(newInputValue: string) {
      let tempMap = new Map();
      handledLoanRecords.forEach((loanRecords: any, address: string) => {
        if (address.toLowerCase().search(newInputValue.toLowerCase()) !== -1) {
          tempMap.set(address, loanRecords);
        }
      });
      filteredList.value = tempMap;
    }

    function filterByToggle() {
      switch (toggleValue.value) {
        case "all":
          filteredList.value = handledLoanRecords;
          break;
        case "active": {
          let tempMap = new Map();
          handledLoanRecords.forEach((loanRecords: any, address: string) => {
            let tempRecords: any[] = [];
            loanRecords.forEach((loanRecord: any) => {
              if (!loanRecord.isClosed) {
                tempRecords.push(loanRecord);
              }
            });
            if (tempRecords.length > 0) {
              tempMap.set(address, tempRecords);
            }
          });
          filteredList.value = tempMap;
          break;
        }
        case "marginCall": {
          let tempMap = new Map();
          handledLoanRecords.forEach((loanRecords: any, address: string) => {
            let tempRecords: any[] = [];
            loanRecords.forEach((loanRecord: any) => {
              if (loanRecord.isMarginCall) {
                tempRecords.push(loanRecord);
              }
            });
            if (tempRecords.length > 0) {
              tempMap.set(address, tempRecords);
            }
          });
          filteredList.value = tempMap;
          break;
        }
        case "liquidable": {
          let tempMap = new Map();
          handledLoanRecords.forEach((loanRecords: any, address: string) => {
            let tempRecords: any[] = [];
            loanRecords.forEach((loanRecord: any) => {
              if (loanRecord.isLiquidable) {
                tempRecords.push(loanRecord);
              }
            });
            if (tempRecords.length > 0) {
              tempMap.set(address, tempRecords);
            }
          });
          filteredList.value = tempMap;
          break;
        }
      }
    }

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

    async function marginCall(idxArr: number[]) {
      try {
        showModal.value = true;
      } catch (error) {
        console.error(error);
      }
    }

    async function liquidateLoan(loanId: string, amount: string, idx: number) {
      if (false) {
        const mintTx = await commonStore.getERC20.mint(
          accountStore.getAccount,
          BigNumber.from(2000000).mul(loanStore.getExp)
        );
        const res = await mintTx.wait();
        console.log("mint result:", res);
      }
      if (false) {
        const approveAmount = BigNumber.from(2).pow(256).sub(1);
        const approveTx = await commonStore.getERC20.approve(
          commonStore.getProtocolAddress,
          approveAmount
        );
        const result = await approveTx.wait();
        console.log("Approve result:", result);
      }
      let tx;
      let result;
      try {
        const remainingDebt = amount.slice(0, amount.length - 4);
        const liquidateAmount = BigNumber.from(remainingDebt).mul(
          loanStore.getExp
        );
        tx = await commonStore.getProtocol.liquidateLoan(
          loanId,
          liquidateAmount
        );
      } catch (error) {
        console.error(error);
        return;
      }
      try {
        liquidateLoadingMap.value.set(loanId, true);
        pendingStore.increment();
        result = await tx.wait();
        liquidateLoadingMap.value.set(loanId, false);
        pendingStore.decrement();
        console.log("liquidateLoan result:", result);
      } catch (error) {
        console.error(error);
        liquidateLoadingMap.value.set(loanId, false);
        pendingStore.decrement();
      }
    }

    const theme = computed(() => {
      return useGlobalConfig().getGlobalConfig().colors || {};
    });

    function handleRawLoanRecords(rawLoanRecords: Map<string, any>) {
      let tempMap = new Map();
      let date = new Date();
      rawLoanRecords.forEach((loanRecords: any, address: string) => {
        let tempRecords: any = [];
        loanRecords.forEach((loanRecord: any) => {
          let tempRecord = {
            loanId: loanRecord.loanId,
            loanTokenAddress: loanRecord.loanTokenAddress,
            collateralTokenAddress: loanRecord.collateralTokenAddress,
            loanAmount:
              loanRecord.loanAmount.div(loanStore.getExp).toNumber() + " SGC",
            collateralAmount:
              loanRecord.collateralAmount.div(loanStore.getExp).toNumber() +
              " SGC",
            loanTerm: loanRecord.loanTerm.toNumber() + " Days",
            annualInterestRate:
              loanRecord.annualInterestRate
                .div(loanStore.getExp)
                .mul(100)
                .toNumber() + "%",
            interest:
              loanRecord.interest.div(loanStore.getExp).toNumber() + " SGC",
            collateralCoverageRatio:
              loanRecord.collateralCoverageRatio
                .div(loanStore.getExp)
                .mul(100)
                .toNumber() + "%",
            minCollateralCoverageRatio:
              loanRecord.minCollateralCoverageRatio
                .div(loanStore.getExp)
                .mul(100)
                .toNumber() + "%",
            alreadyPaidAmount:
              loanRecord.alreadyPaidAmount.div(loanStore.getExp).toNumber() +
              " SGC",
            liquidatedAmount:
              loanRecord.liquidatedAmount.div(loanStore.getExp).toNumber() +
              " SGC",
            soldCollateralAmount:
              loanRecord.soldCollateralAmount.div(loanStore.getExp).toNumber() +
              " SGC",
            createdAt: utils.formatTimestamp(loanRecord.createdAt.toNumber()),
            dueAt: utils.formatTimestamp(loanRecord.dueAt.toNumber()),
            remainingDebt:
              loanRecord.remainingDebt.div(loanStore.getExp).toNumber() +
              " SGC",
            isClosed: loanRecord.isClosed,
            isMarginCall:
              !loanRecord.isClosed &&
              loanRecord.collateralCoverageRatio.lte(
                marginCollateralCoverageRatio
              ),
            isLiquidable:
              !loanRecord.isClosed &&
              (loanRecord.collateralCoverageRatio.lt(
                loanRecord.minCollateralCoverageRatio
              ) ||
                loanRecord.dueAt.mul(1000).lt(BigNumber.from(date.getTime()))),
          };
          tempRecords.push(tempRecord);

          liquidateLoadingMap.value.set(loanRecord.loanId, false);
          marginCallLoadingMap.value.set(loanRecord.loanId, false);
        });
        tempMap.set(address, tempRecords);
      });
      return tempMap;
    }

    function copyToClipboard(copyValue: string) {
      //create new element
      let oInput = document.createElement("input");
      //assign value
      oInput.value = copyValue;
      //add new element to body
      document.body.appendChild(oInput);
      //select object
      oInput.select();
      //execute copy method
      document.execCommand("Copy");
      //delete new element
      document.body.removeChild(oInput);
    }

    const openNotification = (message: string, color: string) => {
      _this?.$vaToast.init({
        message: message,
        color: color,
        iconClass: "fa-star-o",
        position: "bottom-right",
        duration: Number(4000),
        fullWidth: false,
      });
    };

    return {
      theme,
      showModal,
      loanRecordsKeyIcon,
      toggleOptions,
      toggleValue,
      filterInput,
      whitelistedBorrowers,
      loanRecords: filteredList,
      formatObjectKey: utils.formatObjectKey,
      getCollapseColor,
      marginCall,
      liquidateLoan,
      copyToClipboard,
      marginCallLoadingMap,
      liquidateLoadingMap,
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

.loanList-select {
  display: flex;
  justify-content: space-between;
  // background-color: white;
  width: 100%;
  height: 100%;
}
.loanDetail-buttons {
  display: flex;
  justify-content: right;
  margin-top: 40px;
}
</style>

<template>
  <div class="row row-equal">
    <div class="xs12 sm12 loanList-select">
      <va-input
        class="flex md4"
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
        class="mt-2"
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
                    <va-avatar icon="label" size="small">
                      <!-- <va-icon name="label_outline" size="2rem" color="gray" /> -->
                    </va-avatar>
                  </va-list-item-section>
                  <va-list-item-section>
                    <va-list-item-label>
                      {{ formatObjectKey(keyRecord) }}
                    </va-list-item-label>
                  </va-list-item-section>
                  <va-list-item-label caption>
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
                    :loading="
                      borrowersIdx === marginCallLoadingId[0] &&
                      index === marginCallLoadingId[1]
                    "
                    @click="marginCall([borrowersIdx, index])"
                    color="warning"
                    >Margin Call</va-button
                  >
                  <va-button
                    class="mr-4 mb-2"
                    :disabled="!loanRecord.isLiquidable"
                    :loading="index === liquidateLoadingId"
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
import { computed, watch, ref, defineComponent } from "vue";
import { useGlobalConfig } from "vuestic-ui";
import { useLoanStore } from "@/store/Loan";
import { useCommonStore } from "@/store/Common";
import { BigNumber, ethers } from "ethers";
import utils from "@/utils";

export default defineComponent({
  name: "LoanListCards",
  async setup() {
    const toggleOptions = [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Margin", value: "marginCall" },
      { label: "Liquidable", value: "liquidable" },
    ];
    let toggleValue = ref("all");

    const commonStore = useCommonStore();

    const loanStore = useLoanStore();
    await loanStore.init();

    const handledLoanRecords = loanStore.getHandledLoanRecords;
    console.log("loanRecords=", handledLoanRecords);

    const whitelist = loanStore.getWhitelist;

    let marginCallLoadingId = ref([-1, -1]);
    let liquidateLoadingId = ref(-1);

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
            tempMap.set(address, tempRecords);
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
            tempMap.set(address, tempRecords);
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
            tempMap.set(address, tempRecords);
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
        marginCallLoadingId.value = idxArr;
        console.log("Margin Call where idx = ", idxArr);
      } catch (error) {
        marginCallLoadingId.value = [-1, -1];
        console.error(error);
      }
    }

    async function liquidateLoan(loanId: string, amount: number, idx: number) {
      try {
        liquidateLoadingId.value = idx;
        console.log("loanId=", loanId);
        console.log("length of loanId=", loanId.length);
        // console.log("ethers.utils.parseBytes32String=", ethers.utils.parseBytes32String(loanId))
        const liquidateAmount = BigNumber.from(amount).mul(loanStore.getExp);
        // const liquidateLoanId = ethers.utils.formatBytes32String(loanId);
        // console.log("liquidateLoanId=", liquidateLoanId);
        console.log("liquidateAmount=", liquidateAmount);
        const result = await commonStore.getProtocol.liquidateLoan(
          loanId,
          liquidateAmount
        );
        console.log(result);
        liquidateLoadingId.value = -1;
      } catch (error) {
        console.error(error);
        liquidateLoadingId.value = -1;
      }
    }

    const theme = computed(() => {
      return useGlobalConfig().getGlobalConfig().colors || {};
    });

    function copyToClipboard(copyValue: string) {
      //创建一个新组件
      let oInput = document.createElement("input");
      //给新组件赋值
      oInput.value = copyValue;
      //添加新节点到页面body中
      document.body.appendChild(oInput);
      //选择对象
      oInput.select();
      //对选择对象的值进行复制到浏览器中
      document.execCommand("Copy");
      //删除新节点(重置操作)
      document.body.removeChild(oInput);
    }

    return {
      theme,
      toggleOptions,
      toggleValue,
      filterInput,
      whitelist,
      loanRecords: filteredList,
      formatTimestamp: utils.formatTimestamp,
      formatObjectKey: utils.formatObjectKey,
      getCollapseColor,
      marginCall,
      liquidateLoan,
      copyToClipboard,
      marginCallLoadingId,
      liquidateLoadingId,
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

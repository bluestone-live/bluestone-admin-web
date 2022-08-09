<template>
  <div class="flex xs12 md12 xl12">
    <va-card class="mb-4">
      <va-card-title>
        <h1>{{ $t("whitelist.lender.newTitle") }}</h1>
      </va-card-title>
      <va-card-content>
        <va-input
          class="mb-4"
          v-model="newLenderAddress"
          label="Lender Address"
          placeholder="0x..."
          :disabled="isAddLoading"
        />
        <va-button
          @click="addWhitelist(newLenderAddress)"
          :loading="isAddLoading"
          >{{ $t("whitelist.lender.newButton") }}</va-button
        >
      </va-card-content>
    </va-card>
    <va-card class="d-flex" stripe stripe-color="info">
      <va-card-title>
        <h1>{{ $t("whitelist.lender.addedTitle") }}</h1>
      </va-card-title>
      <va-card-content>
        <div class="row">
          <va-input
            class="flex mb-2 md6"
            placeholder="Filter..."
            v-model="filter"
          />
        </div>

        <va-data-table
          striped
          :loading="isTableLoading"
          :items="whitelistedLenders"
          :columns="columns"
          :filter="filter"
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="{ rowIndex }">
            {{ rowIndex }}
          </template>
          <template #cell(address)="{ rowIndex }">
            {{ whitelistedLenders[rowIndex] }}
          </template>
          <template #cell(option)="{ rowIndex }">
            <va-button
              size="small"
              color="danger"
              :loading="removeLoadingMap.get(whitelistedLenders[rowIndex])"
              @click="removeWhitelist(whitelistedLenders[rowIndex])"
            >
              Remove
            </va-button>
          </template>
        </va-data-table>

        <va-alert class="mt-3" color="info" outline>
          <span>
            {{ $t("whitelist.lender.filteredCount") }}
            <va-chip>{{ filteredCount }}</va-chip>
          </span>
        </va-alert>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance } from "vue";
import { useWhitelistStore } from "@/store/Whitelist.js";
import { usePendingStore } from "@/store/Pending.js";
import utils from "@/utils";

export default defineComponent({
  name: "BorrowerWhitelist",
  components: {},
  async setup(props, ctx) {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const pendingStore = usePendingStore();
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.getInitStatus) {
      await whitelistStore.init();
    }

    let whitelistedLenders = ref(whitelistStore.getWhitelistedLenders);
    let removeLoadingMap = ref(new Map<string, boolean>());

    whitelistedLenders.value.forEach((borrowerAddress: string) => {
      removeLoadingMap.value.set(borrowerAddress, false);
    });
    console.log("removeLoadingMap=", removeLoadingMap.value);
    const columns = [{ key: "id" }, { key: "address" }, { key: "option" }];

    let filter = ref("");
    let filteredCount = ref(whitelistedLenders.value.length);
    let newLenderAddress = ref("");
    let isAddLoading = ref(false);
    let isRemoveLoading = ref(false);
    let isTableLoading = ref(false);
    let removeLoadingId = ref(-1);

    async function reloadTable() {
      try {
        isTableLoading.value = true;
        await whitelistStore.initWhitelistedLenders();
        whitelistedLenders.value = whitelistStore.getWhitelistedLenders;
        isTableLoading.value = false;
      } catch (error) {
        isTableLoading.value = false;
        console.error(error);
        openNotification(
          "Refresh table failed. Please refresh page manually.",
          "warning"
        );
      }
    }

    async function removeWhitelist(address: string) {
      let tx;
      let result;
      try {
        tx = await whitelistStore.getWhitelistInstance.removeLenderWhitelisted(
          address
        );
      } catch (error) {
        console.error(error);
        return;
      }
      try {
        removeLoadingMap.value.set(address, true);
        pendingStore.increment();
        result = await tx.wait();
        console.log("remove result: ", result);
        pendingStore.decrement();
        reloadTable();
        removeLoadingMap.value.set(address, false);
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from administrators whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
        pendingStore.decrement();
        removeLoadingMap.value.set(address, false);
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from administrators whitelist failed.",
          "danger"
        );
      }
    }

    async function addWhitelist(address: string) {
      let tx;
      let result;
      try {
        tx = await whitelistStore.getWhitelistInstance.addLenderWhitelisted(
          address
        );
        isAddLoading.value = true;
        pendingStore.increment();
        isAddLoading.value = false;
        newLenderAddress.value = "";
        console.log(tx);
      } catch (error) {
        console.error(error);
        return;
      }
      try {
        result = await tx.wait();
        pendingStore.decrement();
        console.log("add result: ", result);
        reloadTable();
        openNotification(
          "Add account [" +
            utils.shortenAddress(address) +
            "] to administrators whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
        pendingStore.decrement();
        openNotification(
          "Add account [" +
            utils.shortenAddress(address) +
            "] to administrators whitelist failed.",
          "danger"
        );
        isAddLoading.value = false;
      }
    }

    const openNotification = (message: string, color: string) => {
      _this?.$vaToast.init({
        message: message,
        color: color,
        iconClass: "fa-star-o",
        position: "bottom-right",
        duration: Number(10000),
        title: "Whitelist: Lender",
        fullWidth: false,
      });
    };

    return {
      whitelistedLenders,
      removeLoadingMap,
      columns,
      filteredCount,
      filter,
      newLenderAddress,
      isAddLoading,
      isRemoveLoading,
      isTableLoading,
      removeLoadingId,
      removeWhitelist,
      addWhitelist,
    };
  },
});
</script>

<style lang="scss">
.markup-tables {
  .table-wrapper {
    overflow: auto;
  }

  .va-table {
    width: 100%;
  }
}
</style>
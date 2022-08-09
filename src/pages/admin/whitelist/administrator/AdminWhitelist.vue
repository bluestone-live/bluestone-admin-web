<template>
  <div class="flex xs12 md12 xl12">
    <va-card class="mb-4" :disabled="!isOwner">
      <va-card-title>
        <h1>{{ $t("whitelist.administrator.newTitle") }}</h1>
      </va-card-title>
      <va-card-content>
        <va-input
          class="mb-4"
          v-model="newAdministratorAddress"
          label="Administrator Address"
          placeholder="0x..."
          :disabled="isAddLoading"
        />
        <va-button
          @click="addWhitelist(newAdministratorAddress)"
          :loading="isAddLoading"
          >{{ $t("whitelist.administrator.newButton") }}</va-button
        >
      </va-card-content>
    </va-card>
    <va-card class="d-flex" stripe stripe-color="info" :disabled="!isOwner">
      <va-card-title>
        <h1>{{ $t("whitelist.administrator.addedTitle") }}</h1>
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
          :items="administrators"
          :columns="columns"
          :filter="filter"
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="{ rowIndex }">
            {{ rowIndex }}
          </template>
          <template #cell(address)="{ rowIndex }">
            <va-icon
              v-if="administrators[rowIndex] == ownerAccount"
              class="mr-1"
              name="settings"
            ></va-icon>
            {{ administrators[rowIndex] }}
          </template>
          <template #cell(option)="{ rowIndex }">
            <va-button
              size="small"
              color="danger"
              :disabled="administrators[rowIndex] == ownerAccount"
              :loading="removeLoadingMap.get(administrators[rowIndex])"
              @click="removeWhitelist(administrators[rowIndex])"
            >
              Remove
            </va-button>
          </template>
        </va-data-table>

        <va-alert class="mt-3" color="info" outline>
          <span>
            {{ $t("whitelist.administrator.filteredCount") }}
            <va-chip>{{ filteredCount }}</va-chip>
          </span>
        </va-alert>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  getCurrentInstance,
  computed,
  reactive,
} from "vue";
import { useAccountStore } from "@/store/Account.js";
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
    const accountStore = useAccountStore();
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.getInitStatus) {
      await whitelistStore.init();
    }
    let currentAccount: String = accountStore.getAccount;
    const ownerAccount: String =
      await whitelistStore.getWhitelistInstance.owner();

    let isOwner = computed(() => {
      return currentAccount.toLowerCase() == ownerAccount.toLowerCase();
    });

    let administrators = ref(whitelistStore.getAdministrators);
    let removeLoadingMap = reactive(new Map<string, boolean>());

    administrators.value.forEach((borrowerAddress: string) => {
      removeLoadingMap.set(borrowerAddress, false);
    });
    const columns = [{ key: "id" }, { key: "address" }, { key: "option" }];

    let filter = ref("");
    let filteredCount = ref(administrators.value.length);
    let newAdministratorAddress = ref("");
    let isAddLoading = ref(false);
    let isRemoveLoading = ref(false);
    let isTableLoading = ref(false);
    let removeLoadingId = ref(-1);

    async function reloadTable() {
      try {
        isTableLoading.value = true;
        await whitelistStore.initAdministrators();
        administrators.value = whitelistStore.getAdministrators;
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
        tx = await whitelistStore.getWhitelistInstance.removeAdministrator(
          address
        );
        console.log(tx);
      } catch (error) {
        console.error(error);
        return;
      }
      try {
        removeLoadingMap.set(address, true);
        pendingStore.increment();
        result = await tx.wait();
        console.log("remove result: ", result);
        pendingStore.decrement();
        reloadTable();
        removeLoadingMap.set(address, false);
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from administrators whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
        pendingStore.decrement();
        removeLoadingMap.set(address, false);
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
        tx = await whitelistStore.getWhitelistInstance.addAdministrator(
          address
        );
        isAddLoading.value = true;
        pendingStore.increment();
        isAddLoading.value = false;
        newAdministratorAddress.value = "";
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
        title: "Whitelist: Administrator",
        fullWidth: false,
      });
    };

    return {
      isOwner,
      ownerAccount,
      administrators,
      removeLoadingMap,
      columns,
      filteredCount,
      filter,
      newAdministratorAddress,
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
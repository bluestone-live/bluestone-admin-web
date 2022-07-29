<template>
  <div class="flex xs12 md12 xl12">
    <va-card class="mb-4">
      <va-card-title>
        <h1>{{ $t("whitelist.borrower.newTitle") }}</h1></va-card-title
      >
      <va-card-content>
        <va-input
          class="mb-4"
          v-model="newBorrowerAddress"
          label="Borrower Address"
          placeholder="0x..."
          :disabled="isAddLoading"
        />
        <va-button
          @click="addWhitelist(newBorrowerAddress)"
          :loading="isAddLoading"
          >{{ $t("whitelist.borrower.newButton") }}</va-button
        >
      </va-card-content>
    </va-card>
    <va-card class="d-flex" stripe stripe-color="info">
      <va-card-title>
        <h1>{{ $t("whitelist.borrower.addedTitle") }}</h1>
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
          :items="whitelist"
          :columns="columns"
          :filter="filter"
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="{ rowIndex }">
            {{ rowIndex }}
          </template>
          <template #cell(address)="{ value }">
            {{ value }}
          </template>
          <template #cell(status)="{ value }"
            ><va-chip
              square
              outline
              size="small"
              :color="value == 'active' ? 'success' : 'danger'"
              >{{ value }}</va-chip
            ></template
          >
          <template #cell(option)="{ value, rowIndex }"
            ><va-button
              size="small"
              color="danger"
              :loading="isLoadingMap[whitelist[rowIndex].address]"
              @click="removeWhitelist(whitelist[rowIndex].address)"
              >{{ value }}</va-button
            ></template
          >
        </va-data-table>

        <va-alert class="mt-3" color="info" outline>
          <span>
            {{ $t("whitelist.borrower.filteredCount") }}
            <va-chip>{{ filteredCount }}</va-chip>
          </span>
        </va-alert>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance } from "vue";
import { useLoanStore } from "@/store/Loan";
import { usePendingStore } from "@/store/Pending";
import utils from "@/utils";
class WhiteListItem {
  address: string;
  status: string;
  option: string;

  constructor(address: string, status: string, option: string) {
    this.address = address;
    this.status = status;
    this.option = option;
  }
}

export default defineComponent({
  name: "BorrowerWhitelist",
  components: {},
  async setup(props, ctx) {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const pendingStore = usePendingStore();

    const loanStore = useLoanStore();
    await loanStore.init();

    const borrowersOnWhitelists = loanStore.getWhitelist;
    const activeBorrowers = loanStore.getActiveBorrowers;
    let whitelist = ref(Array<WhiteListItem>());
    let isLoadingMap = ref(new Map<string, boolean>());

    borrowersOnWhitelists.forEach((borrowerAddress: string) => {
      let borrowerStatus =
        activeBorrowers.indexOf(borrowerAddress) >= 0 ? "active" : "inactive";
      whitelist.value.push({
        address: borrowerAddress,
        status: borrowerStatus,
        option: "Remove",
      });
      isLoadingMap.value.set(borrowerAddress, false);
    });
    console.log("isLoadingMap=", isLoadingMap.value);
    const columns = [
      { key: "id" },
      { key: "address" },
      { key: "status" },
      { key: "option" },
    ];

    let filter = ref("");
    let filteredCount = ref(whitelist.value.length);
    let newBorrowerAddress = ref("");
    let isAddLoading = ref(false);
    let isRemoveLoading = ref(false);
    let isTableLoading = ref(false);
    let removeLoadingId = ref(-1);

    async function reloadTable() {
      try {
        isTableLoading.value = true;
        let tempWhitelist: Array<WhiteListItem> = [];
        await loanStore.initWhitelist();
        let borrowersOnWhitelists = loanStore.getWhitelist;
        borrowersOnWhitelists.forEach((borrowerAddress) => {
          let borrowerStatus =
            activeBorrowers.indexOf(borrowerAddress) >= 0
              ? "active"
              : "inactive";
          tempWhitelist.push(
            new WhiteListItem(borrowerAddress, borrowerStatus, "Remove")
          );
        });
        whitelist.value = tempWhitelist;
        isTableLoading.value = false;
      } catch (error) {
        isTableLoading.value = false;
        console.error(error);
      }
    }

    async function removeWhitelist(address: string) {
      isLoadingMap.value.set(address, true);
      let tx;
      let result;
      try {
        tx = await loanStore.getWhitelistInstance.removeWhitelisted(address);
        pendingStore.increment();
        console.log(tx);
      } catch (error) {
        console.error(error);
        return;
      }
      try {
        result = await tx.wait();
        console.log("remove result: ", result);
        pendingStore.decrement();
        reloadTable();
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
        pendingStore.decrement();
        isLoadingMap.value.set(address, false);
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from whitelist failed.",
          "danger"
        );
      }
    }

    async function addWhitelist(address: string) {
      let tx;
      let result;
      try {
        tx = await loanStore.getWhitelistInstance.addWhitelisted(address);
        isAddLoading.value = true;
        pendingStore.increment();
        isAddLoading.value = false;
        newBorrowerAddress.value = "";
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
            "] to whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
        pendingStore.decrement();
        openNotification(
          "Add account [" +
            utils.shortenAddress(address) +
            "] to whitelist failed.",
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
        duration: Number(4000),
        fullWidth: false,
      });
    };

    return {
      whitelist,
      isLoadingMap,
      columns,
      filteredCount,
      filter,
      newBorrowerAddress,
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
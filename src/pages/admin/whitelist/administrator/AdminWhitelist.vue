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
              :loading="rowIndex === removeLoadingId"
              @click="removeWhitelist(whitelist[rowIndex].address, rowIndex)"
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
import { defineComponent, ref, getCurrentInstance, onMounted } from "vue";
import { useLoanStore } from "@/store/Loan";
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
  name: "AdminWhitelist",
  components: {},
  async setup() {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const loanStore = useLoanStore();
    await loanStore.init();
    console.log("loanStore.getWhitelist=", loanStore.getWhitelist);

    const borrowersOnWhitelists = loanStore.getWhitelist;
    const activeBorrowers = loanStore.getActiveBorrowers;
    let whitelist = ref(Array<WhiteListItem>());

    borrowersOnWhitelists.forEach((borrowerAddress) => {
      let borrowerStatus =
        activeBorrowers.indexOf(borrowerAddress) >= 0 ? "active" : "inactive";
      whitelist.value.push({
        address: borrowerAddress,
        status: borrowerStatus,
        option: "Remove",
      });
    });
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

    async function removeWhitelist(address: string, idx: number) {
      try {
        console.log("idx=", idx);
        removeLoadingId.value = idx;
        const tx = await loanStore.getWhitelistInstance.removeWhitelisted(
          address
        );
        openNotification(
          "Wait for the [Remove] transaction to be mined...",
          "primary"
        );
        console.log(tx);
        const result = await tx.wait();
        console.log("remove result: ", result);
        removeLoadingId.value = -1;
        reloadTable();
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
        openNotification(
          "Remove account [" +
            utils.shortenAddress(address) +
            "] from whitelist failed.",
          "danger"
        );
        removeLoadingId.value = -1;
      }
    }

    async function addWhitelist(address: string) {
      try {
        isAddLoading.value = true;
        const tx = await loanStore.getWhitelistInstance.addWhitelisted(address);
        console.log(tx);
        openNotification(
          "Wait for the [Add] transaction to be mined...",
          "primary"
        );
        const result = await tx.wait();
        console.log("add result: ", result);
        isAddLoading.value = false;
        newBorrowerAddress.value = "";
        reloadTable();
        openNotification(
          "Add account [" +
            utils.shortenAddress(address) +
            "] to whitelist success.",
          "success"
        );
      } catch (error) {
        console.error(error);
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

    // onMounted(async () => {
    //   loanStore.getWhitelistInstance.on(
    //     "AddWhitelisted",
    //     async (account: string) => {
    //       await reloadTable();
    //       console.log("Add ", account, " success.");
    //       openNotification(
    //         "Add account [" +
    //           utils.shortenAddress(account) +
    //           "] to whitelist success.",
    //         "success"
    //       );
    //     }
    //   );
    //   loanStore.getWhitelistInstance.on(
    //     "RemoveWhitelisted",
    //     async (account: string) => {
    //       await reloadTable();
    //       console.log("Remove ", account, " success.");
    //       openNotification(
    //         "Remove account [" +
    //           utils.shortenAddress(account) +
    //           "] from whitelist success.",
    //         "success"
    //       );
    //     }
    //   );
    // });

    return {
      whitelist,
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
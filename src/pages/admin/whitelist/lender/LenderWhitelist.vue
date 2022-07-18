<template>
  <div class="flex xs12 md12 xl12">
    <va-card class="mb-4">
      <va-card-title>
        <h1>{{ $t("whitelist.lender.newTitle") }}</h1></va-card-title
      >
      <va-card-content>
        <va-input
          class="mb-4"
          v-model="newBorrowerAddress"
          label="Lender Address"
          placeholder="0x..."
          :disabled="isAddLoading"
        />
        <va-button
          @click="addWhitelist(newBorrowerAddress)"
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
              :loading="rowIndex === removeLoadingId ? true : false"
              @click="removeWhitelist(whitelist[rowIndex].address, rowIndex)"
              >{{ value }}</va-button
            ></template
          >
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
import { computed, defineComponent, ref, getCurrentInstance } from "vue";
import { useLoanStore } from "@/store/Loan";

export default defineComponent({
  name: "LenderWhitelist",
  components: {},
  async setup() {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const loanStore = useLoanStore();
    await loanStore.init();

    const borrowersOnWhitelists = loanStore.getWhitelist;
    const activeBorrowers = loanStore.getActiveBorrowers;

    console.log("borrowers whitelist=", borrowersOnWhitelists);

    let whitelist: any = [];
    borrowersOnWhitelists.forEach((borrowerAddress) => {
      let borrowerStatus =
        activeBorrowers.indexOf(borrowerAddress) >= 0 ? "active" : "inactive";
      whitelist.push({
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
    let filteredCount = ref(whitelist.length);
    let newBorrowerAddress = ref("");
    let isAddLoading = ref(false);
    let isRemoveLoading = ref(false);
    let removeLoadingId = ref(-1);

    async function removeWhitelist(address: string, idx: number) {
      try {
        console.log("idx=", idx);
        removeLoadingId.value = idx;
        // isRemoveLoading.value = true;
        console.log("removeLoadingId=", removeLoadingId.value);
        const result = await loanStore.getWhitelistInstance.removeWhitelisted(
          address
        );
        console.log(result);
        openNotification("Remove address from whitelist success.", "success");
        // isRemoveLoading.value = false;
        removeLoadingId.value = -1;
      } catch (error) {
        console.error(error);
        openNotification("Remove address from whitelist failed.", "danger");
        // isRemoveLoading.value = false;
        removeLoadingId.value = -1;
      }
    }

    async function addWhitelist(address: string) {
      try {
        isAddLoading.value = true;
        const result = await loanStore.getWhitelistInstance.addWhitelisted(
          address
        );
        console.log(result);
        openNotification("Add to whitelist success.", "success");
        isAddLoading.value = false;
        newBorrowerAddress.value = "";
      } catch (error) {
        console.error(error);
        openNotification("Add to whitelist failed.", "danger");
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
      columns,
      filteredCount,
      filter,
      newBorrowerAddress,
      isAddLoading,
      isRemoveLoading,
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
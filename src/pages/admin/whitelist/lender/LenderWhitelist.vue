<template>
  <div class="flex xs12 md12 xl12">
    <va-card class="mb-4" :disabled="!state.isAdministrator">
      <va-card-title>
        <h1>{{ $t("whitelist.lender.newTitle") }}</h1>
      </va-card-title>
      <va-card-content>
        <va-input
          class="mb-4"
          v-model="state.newLenderAddress"
          label="Lender Address"
          placeholder="0x..."
          :disabled="state.isAddLoading"
        />
        <va-button
          @click="addWhitelist(state.newLenderAddress)"
          :loading="state.isAddLoading"
          >{{ $t("whitelist.lender.newButton") }}</va-button
        >
      </va-card-content>
    </va-card>
    <va-card
      class="d-flex"
      stripe
      stripe-color="info"
      :disabled="!state.isAdministrator"
    >
      <va-card-title>
        <h1>{{ $t("whitelist.lender.addedTitle") }}</h1>
      </va-card-title>
      <va-card-content>
        <div class="row">
          <va-input
            class="flex mb-2 md6"
            placeholder="Filter..."
            v-model="state.filter"
          />
        </div>

        <va-data-table
          striped
          :loading="state.isTableLoading"
          :items="state.whitelist"
          :columns="state.columns"
          :filter="state.filter"
          @filtered="state.filteredCount = $event.items.length"
        >
          <template #cell(id)="{ rowIndex }">
            {{ rowIndex }}
          </template>
          <template #cell(address)="{ value }">
            {{ value }}
          </template>
          <template #cell(option)="{ rowIndex }">
            <va-button
              size="small"
              color="danger"
              :loading="
                state.removeLoadingMap.get(state.whitelist[rowIndex].address)
              "
              @click="removeWhitelist(state.whitelist[rowIndex].address)"
            >
              Remove
            </va-button>
          </template>
        </va-data-table>

        <va-alert class="mt-3" color="info" outline>
          <span>
            {{ $t("whitelist.lender.filteredCount") }}
            <va-chip>{{ state.filteredCount }}</va-chip>
          </span>
        </va-alert>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCommonStore } from "@/store/Common";
import { useAccountStore } from "@/store/Account";
import { useWhitelistStore } from "@/store/Whitelist";
import { usePendingStore } from "@/store/Pending";
import { useLenderWhitelist } from "@/services/whitelist/lender";

export default defineComponent({
  name: "LenderWhitelist",
  async setup(props, ctx) {
    const commonStore = useCommonStore();
    const accountStore = useAccountStore();
    const pendingStore = usePendingStore();
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.isInited) {
      await whitelistStore.init();
    }

    let { state, removeWhitelist, addWhitelist } = await useLenderWhitelist(
      commonStore,
      pendingStore,
      whitelistStore,
      accountStore
    );

    return {
      state,
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
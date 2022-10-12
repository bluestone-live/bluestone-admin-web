<template>
  <div class="flex xs12 md12 xl12">
    <va-card class="mb-4" :disabled="!state.isOwner">
      <va-card-title>
        <h1>{{ $t("whitelist.administrator.newTitle") }}</h1>
      </va-card-title>
      <va-card-content>
        <va-input
          class="mb-4"
          v-model="state.newAdministratorAddress"
          label="Administrator Address"
          placeholder="0x..."
          :disabled="state.isAddLoading"
        />
        <va-button
          @click="addWhitelist(state.newAdministratorAddress)"
          :loading="state.isAddLoading"
          >{{ $t("whitelist.administrator.newButton") }}</va-button
        >
      </va-card-content>
    </va-card>
    <va-card
      class="d-flex"
      stripe
      stripe-color="info"
      :disabled="!state.isOwner"
    >
      <va-card-title>
        <h1>{{ $t("whitelist.administrator.addedTitle") }}</h1>
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
            <va-icon
              v-if="value == state.ownerAccount"
              class="mr-1"
              name="settings"
            ></va-icon>
            {{ value }}
          </template>
          <template #cell(option)="{ rowIndex }">
            <va-button
              size="small"
              color="danger"
              :disabled="state.whitelist[rowIndex].address == state.ownerAccount"
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
            {{ $t("whitelist.administrator.filteredCount") }}
            <va-chip>{{ state.filteredCount }}</va-chip>
          </span>
        </va-alert>
      </va-card-content>
    </va-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAccountStore } from "@/store/Account";
import { useWhitelistStore } from "@/store/Whitelist";
import { usePendingStore } from "@/store/Pending";
import { useAdminWhitelist } from "@/services/whitelist/administrator";

export default defineComponent({
  name: "BorrowerWhitelist",
  async setup(props, ctx) {
    const pendingStore = usePendingStore();
    const accountStore = useAccountStore();
    const whitelistStore = useWhitelistStore();
    if (!whitelistStore.isInited) {
      await whitelistStore.init();
    }
    let { state, removeWhitelist, addWhitelist } = await useAdminWhitelist(
      pendingStore,
      accountStore,
      whitelistStore
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
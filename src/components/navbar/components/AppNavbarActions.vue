<template>
  <div class="app-navbar-actions">
    <va-badge
      right
      :text="state.badgePendingCount"
      color="warning"
      class="mr-4"
    >
      <va-button
        :color="
          state.showPending
            ? 'success'
            : state.isNetworkErr
            ? 'danger'
            : 'primary'
        "
        @click="copyAddressToClipboard"
      >
        <template #default>
          <div v-if="!state.showPending">
            <va-icon class="mr-1" name="manage_accounts"></va-icon>
            {{ state.accountAddress }}
          </div>
          <div v-else>
            <va-icon
              class="mr-1"
              name="loop"
              spin="counter-clockwise"
            ></va-icon>
            Pending...
          </div>
        </template>
      </va-button>
    </va-badge>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { usePendingStore } from "@/store/Pending";
import { useAccountStore } from "@/store/Account";
import { useCommonStore } from "@/store/Common";
import { useNavbar } from "@/services/navbar";
export default defineComponent({
  name: "app-navbar-actions",
  async setup() {
    const commonStore = useCommonStore();
    const pendingStore = usePendingStore();
    const accountStore = useAccountStore();
    if (!accountStore.isInited) {
      await accountStore.init();
    }
    let { state, copyAddressToClipboard } = useNavbar(
      commonStore,
      accountStore,
      pendingStore
    );

    watch(
      () => pendingStore.pendingCount,
      (newValue) => {
        console.log("newValue=", newValue);
        if (newValue === 0) {
          state.showPending = false;
        } else {
          state.showPending = true;
        }
        state.badgePendingCount = newValue;
      }
    );

    return {
      state,
      copyAddressToClipboard,
    };
  },
});
</script>

<style lang="scss" scoped>
.dropdown-items {
  display: flex;
  align-items: center;
  span {
    color: rgb(113, 114, 115);
    font-size: 18px;
  }
  img {
    width: 25px;
    height: 25px;
  }
  :hover {
    color: #154ec1;
    cursor: pointer;
  }
}
.selected-dropdown-icons {
  width: 28px;
  height: 28px;
  transition: all 0.3;
}
.selected-dropdown-icons:hover {
  transform: scale(1.1, 1.1);
  cursor: pointer;
}

.app-navbar-actions {
  display: flex;
  align-items: center;

  .va-dropdown__anchor {
    color: var(--va-primary);
    fill: var(--va-primary);
  }

  &__item {
    padding: 0;
    margin-left: 1.25rem;
    margin-right: 1.25rem;

    svg {
      height: 24px;
    }

    &:last-of-type {
      margin-right: 0;
    }

    &--profile {
      display: flex;
      justify-content: center;
      margin: auto 0 auto 1.25rem;
    }

    .va-dropdown-content {
      background-color: var(--va-white);
    }

    @media screen and (max-width: 768px) {
      margin-right: 0;

      &:first-of-type {
        margin-left: 0;
      }

      &--profile {
        position: absolute;
        right: 0.75rem;
        top: 1.25rem;
        height: fit-content;
        margin: auto;
      }
    }
  }
}
</style>

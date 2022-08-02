<template>
  <div class="app-navbar-actions">
    <va-badge left :text="badgePendingCount" color="warning" class="mr-4">
      <va-button
        v-if="isWalletConnect"
        :color="showPending ? 'success' : 'primary'"
      >
        <template #default>
          <div v-if="!showPending">
            <va-icon class="mr-1" name="settings"></va-icon>
            {{ userName }}
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
      <va-button v-else @click="connectWallet" color="danger">
        <template #default>
          <va-icon class="mr-1" name="wallet"></va-icon>
          {{ userName }}
        </template>
      </va-button>
    </va-badge>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { usePendingStore } from "@/store/Pending";
import { useAccountStore } from "@/store/Account";
export default defineComponent({
  name: "app-navbar-actions",
  props: {
    isWalletConnect: {
      type: Boolean,
      default: false,
    },
    userName: {
      type: String,
      default: "",
    },
    isTopBar: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const accountStore = useAccountStore();
    const pendingStore = usePendingStore();

    let iconName = ref("settings");
    let badgePendingCount = ref(0);
    let showPending = ref(false);

    pendingStore.$subscribe(() => {
      console.log("Pending State Changed");
      if (pendingStore.getPendingCount === 0) {
        showPending.value = false;
      } else {
        showPending.value = true;
      }
      badgePendingCount.value = pendingStore.getPendingCount;
    });

    async function connectWallet() {
      await accountStore.init();
    }

    return {
      iconName,
      showPending,
      badgePendingCount,
      connectWallet,
    };
  },
  computed: {
    isTopBarProxy: {
      get() {
        return this.isTopBar;
      },
      set(isTopBar: any) {
        this.$emit("update:isTopBar", isTopBar);
      },
    },
  },
});
</script>

<style lang="scss">
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

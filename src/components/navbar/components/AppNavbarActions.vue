<template>
  <div class="app-navbar-actions">
    <va-badge left :text="badgePendingCount" color="warning" class="mr-4">
      <va-button
        v-if="isWalletConnect"
        :color="showPending ? 'success' : isNetworkErr ? 'danger' : 'primary'"
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
import { defineComponent, getCurrentInstance, onMounted, ref } from "vue";
import { usePendingStore } from "@/store/Pending.js";
import { useAccountStore } from "@/store/Account.js";
import { useCommonStore } from "@/store/Common";
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
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const commonStore = useCommonStore();
    const accountStore = useAccountStore();
    const pendingStore = usePendingStore();

    const availableNetwork = 42;

    let iconName = ref("settings");
    let badgePendingCount = ref(0);
    let showPending = ref(false);
    let isNetworkErr = ref(false);

    pendingStore.$subscribe(() => {
      if (pendingStore.getPendingCount === 0) {
        showPending.value = false;
      } else {
        showPending.value = true;
      }
      badgePendingCount.value = pendingStore.getPendingCount;
    });

    onMounted(() => {
      if (commonStore.getNetworkId != availableNetwork) {
        isNetworkErr.value = true;
        openNotification(
          "Please change Network to Kovan testnet.",
          "danger"
        )
      }
      commonStore.getProvider.provider.on("accountsChanged", () => {
        location.reload();
      });
      commonStore.getProvider.provider.on("chainChanged", () => {
        location.reload();
      });
    });

    async function connectWallet() {
      await accountStore.init();
    }

    const openNotification = (message: string, color: string) => {
      _this?.$vaToast.init({
        message: message,
        color: color,
        iconClass: "fa-star-o",
        position: "bottom-right",
        duration: Number(1000000),
        title: "Metamask",
        fullWidth: false,
      });
    };

    return {
      iconName,
      showPending,
      isNetworkErr,
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

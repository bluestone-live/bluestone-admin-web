<template>
  <div class="app-navbar-actions">
    <va-dropdown fixed position="bottom">
      <template #anchor>
        <img
          class="selected-dropdown-icons mr-3"
          :src="dropdownMap.get(selectedWallet)"
        />
      </template>
      <va-dropdown-content class="pl-4 pr-4 pt-2 pb-2">
        <div
          class="dropdown-items mt-3 mb-2"
          v-for="item in dropdownMap"
          @click="selectWallet(item[0])"
          :key="item[1]"
        >
          <img class="mr-2" :src="item[1]" />
          <span>{{ item[0] }}</span>
        </div>
      </va-dropdown-content>
    </va-dropdown>

    <va-badge right :text="badgePendingCount" color="warning" class="mr-4">
      <va-button
        v-if="isWalletConnect"
        :color="showPending ? 'success' : isNetworkErr ? 'danger' : 'primary'"
      >
        <template #default>
          <div v-if="!showPending">
            <va-icon class="mr-1" name="settings"></va-icon>
            {{ accountAddress }}
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
          {{ accountAddress }}
        </template>
      </va-button>
    </va-badge>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  ref,
  watch,
} from "vue";
import { usePendingStore } from "@/store/Pending";
import { useAccountStore } from "@/store/Account";
import { useCommonStore } from "@/store/Common";
import { NetworkType, WalletSelector } from "@/services/types";
import utils from "@/utils/index";
export default defineComponent({
  name: "app-navbar-actions",
  async setup() {
    const instance = getCurrentInstance();
    const _this = instance?.appContext.config.globalProperties;

    const commonStore = useCommonStore();
    const pendingStore = usePendingStore();
    const accountStore = useAccountStore();

    if (!accountStore.isInited) {
      await accountStore.init();
    }

    let isWalletConnect = ref(
      commonStore.wallet == WalletSelector.Disconnect ? false : true
    );
    let accountAddress = ref(utils.shortenAddress(accountStore.getAccount));

    const dropdownMap = new Map<WalletSelector, any>();
    dropdownMap.set(WalletSelector.MetaMask, new URL("../../../assets/wallet/metamask.svg", import.meta.url).href);
    dropdownMap.set(
      WalletSelector.WalletConnect,
      new URL("../../../assets/wallet/walletconnect.svg", import.meta.url).href
    );
    dropdownMap.set(
      WalletSelector.Disconnect,
      new URL("../../../assets/wallet/disconnect.svg", import.meta.url).href
    );

    let selectedWallet = ref(commonStore.wallet);

    let iconName = ref("settings");
    let badgePendingCount = ref(0);
    let showPending = ref(false);
    let isNetworkErr = ref(false);

    watch(
      () => commonStore.wallet,
      (cur) => {
        if (commonStore.wallet == WalletSelector.Disconnect) {
          isWalletConnect.value = false;
          accountAddress.value = "Connect Wallet";
        } else {
          selectedWallet.value = cur;
          accountAddress.value = utils.shortenAddress(accountStore.getAccount);
          isWalletConnect.value = true;
        }
      }
    );

    watch(
      () => commonStore.networkType,
      (curNetwork) => {
        if (curNetwork != NetworkType.Kovan) {
          isNetworkErr.value = true;
          openNotification("Please change Network to Kovan testnet.", "danger");
        }
      }
    );

    pendingStore.$subscribe(() => {
      if (pendingStore.pendingCount === 0) {
        showPending.value = false;
      } else {
        showPending.value = true;
      }
      badgePendingCount.value = pendingStore.pendingCount;
    });

    async function connectWallet() {
      await accountStore.init();
    }

    async function selectWallet(wallet: WalletSelector) {
      if (wallet != WalletSelector.Disconnect) {
        commonStore.initWallet(wallet);
        location.reload();
      } else {
        await accountStore.disconnectAccount();
      }
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

    if (commonStore.networkType != NetworkType.Kovan) {
      isNetworkErr.value = true;
      openNotification("Please change Network to Kovan testnet.", "danger");
    }

    return {
      iconName,
      selectedWallet,
      dropdownMap,
      showPending,
      isWalletConnect,
      accountAddress,
      isNetworkErr,
      badgePendingCount,
      connectWallet,
      selectWallet,
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

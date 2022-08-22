<template>
  <div class="row wallets-container">
    <router-link class="flex xs5 sm5 md5 mb-4 img-container" to="/">
        <img
          @click="selectWallet('MetaMask')"
          src="@/assets/metamaskLogo.svg"
        />
    </router-link>
    <router-link class="flex xs5 sm5 md5 mb-4 img-container" to="/">
      <img
        @click="selectWallet('WalletConnect')"
        src="@/assets/walletConnectLogo.svg"
      />
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VaImage } from "vuestic-ui";
import { useCommonStore } from "@/store/Common";
import { WalletSelector } from "@/services/types";

export default defineComponent({
  name: "wallet-connect",
  components: {
    VaImage,
  },
  setup() {
    const commonStore = useCommonStore();
    function selectWallet(type: WalletSelector) {
      switch (type) {
        case WalletSelector.MetaMask:
          console.log("WalletConnect: select MetaMask.");
          commonStore.setWallet(type);
          break;
        case WalletSelector.WalletConnect:
          console.log("WalletConnect: select WalletConnect.");
          commonStore.setWallet(type);
          break;
      }
    }
    return {
      selectWallet,
    };
  },
});
</script>

<style scoped>
.wallets-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.img-container {
  /* height: 80px; */
  display: flex;
  padding: 6px 12px;
  /* border: 1px solid rgb(204, 203, 203); */
  align-items: center;
  border-radius: 5px;
}
img {
  width: 100%;
  transition: all 0.3;
}
img:hover {
  transform: scale(1.1, 1.1);
  cursor: pointer;
}
</style>
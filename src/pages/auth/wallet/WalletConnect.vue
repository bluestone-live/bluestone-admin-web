<template>
  <div class="row wallets-container">
    <div class="flex xs5 sm5 md5 mb-4 img-container">
      <img
        @click="selectWallet(1)"
        src="src/assets/metamaskLogo.svg"
      />
    </div>
    <div class="flex xs5 sm5 md5 mb-4 img-container">
      <img
        @click="selectWallet(2)"
        src="src/assets/walletConnectLogo.svg"
      />
    </div>
    <div class="flex xs5 sm5 md5 img-container">
      <img
        @click="selectWallet(3)"
        src="src/assets/imTokenLogo.svg"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VaImage } from "vuestic-ui";
import {useCommonStore} from "@/store/Common"
import { WalletSelector } from "@/services/types";

export default defineComponent({
  name: "wallet-connect",
  components: {
    VaImage,
  },
  setup() {
    const commonStore = useCommonStore()
    function selectWallet(type: WalletSelector) {
      switch (type) {
        case WalletSelector.MetaMask:
          console.log("WalletConnect: select MetaMask.");
          commonStore.initWallet(type);
          break;
        case WalletSelector.WalletConnect:
          console.log("WalletConnect: select WalletConnect.");
          commonStore.initWallet(type);
          break;
        case WalletSelector.ImToken:
          console.log("WalletConnect: select ImToken.");
          commonStore.initWallet(type);
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
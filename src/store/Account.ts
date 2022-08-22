import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { WalletSelector } from '@/services/types'

export const useAccountStore = defineStore('account', {
  state: () => ({
    isInited: false,
    preWallet: window.localStorage.getItem("wallet") as WalletSelector,
    commonStore: useCommonStore(),
    accounts: [] as string[],
  }),
  getters: {
    getAccount(): string {
      return this.accounts[0]
    },
  },
  actions: {
    async init() {
      try {
        await this.initAccounts()
        this.isInited = true
        console.log("[Account]: Account Store init success.")
      } catch (error) {
        console.log("[Account]: Account Store init failed.")
        console.error(error)
      }
    },
    async initAccounts() {
      if (this.commonStore.wallet == WalletSelector.WalletConnect) {
        this.accounts = await this.commonStore.getWallectConnectProvider.enable();
      } else if (this.commonStore.wallet == WalletSelector.MetaMask) {
        this.accounts = await this.commonStore.getEthersProvider.send("eth_requestAccounts", []);
      }
      this.commonStore.initWallet(this.preWallet)
    },
    async disconnectAccount() {
      if(this.commonStore.wallet == WalletSelector.WalletConnect) {
        await this.commonStore.getWallectConnectProvider.disconnect();
      } 
      this.preWallet = this.commonStore.wallet as WalletSelector;
      this.commonStore.initWallet(WalletSelector.Disconnect);
    }
  },
})
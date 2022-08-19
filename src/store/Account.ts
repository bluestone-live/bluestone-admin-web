import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { WalletSelector } from '@/services/types'

export const useAccountStore = defineStore('account', {
  state: () => ({
    isInited: false,
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
      this.accounts = await this.commonStore.getProvider.enable();
      this.commonStore.initWallet(window.localStorage.getItem("wallet") as WalletSelector)
    },
    async disconnectAccount() {
      if(this.commonStore.wallet == WalletSelector.WalletConnect) {
        await this.commonStore.getProvider.disconnect();
      } else if(this.commonStore.wallet == WalletSelector.MetaMask) {
        await this.commonStore.getProvider.enable();
      }
      this.commonStore.initWallet(WalletSelector.Disconnect);
    }
  },
})
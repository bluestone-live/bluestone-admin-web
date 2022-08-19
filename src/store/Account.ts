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
      this.accounts = await this.commonStore.getProvider.enable();
      this.commonStore.initWallet(this.preWallet)
    },
    async disconnectAccount() {
      if(this.commonStore.wallet == WalletSelector.WalletConnect) {
        await this.commonStore.getProvider.disconnect();
      } 
      this.preWallet = this.commonStore.wallet as WalletSelector;
      this.commonStore.initWallet(WalletSelector.Disconnect);
    }
  },
})
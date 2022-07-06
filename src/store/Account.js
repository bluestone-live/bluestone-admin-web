import { defineStore } from 'pinia'
// import { MetaMaskProvider } from './MetaMaskStore'
import { useCommonStore } from "./Common"

export const useAccountStore = defineStore('AccountStore', {
  state: () => ({
    // provider: new MetaMaskProvider(),
    commonStore: useCommonStore(),
    accounts: null,
  }),
  getters: {
    getAccounts(state) {
      return state.accounts
    },

    getAccount(state) {
      return state.accounts[0]
    }
  },
  actions: {
    init() {
      this.initAccounts()
    },
    initAccounts() {
      this.accounts = this.commonStore.getProvider.send("eth_requestAccounts", [])
    }
  },
})
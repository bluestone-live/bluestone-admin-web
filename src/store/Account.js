import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"

export const useAccountStore = defineStore('AccountStore', {
  state: () => ({
    commonStore: useCommonStore(),
    accounts: [],
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
    async init() {
      await this.initAccounts()
      console.log("Account: init Account success.")
    },
    async initAccounts() {
      this.accounts = await this.commonStore.getProvider.send("eth_requestAccounts", [])
    }
  },
})
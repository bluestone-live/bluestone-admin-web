import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"

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
      this.accounts = await this.commonStore.getProvider.send("eth_requestAccounts", [])
    }
  },
})
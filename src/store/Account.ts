import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
export const useAccountStore = defineStore('account', {
  state: () => ({
    isInited: false,
    commonStore: useCommonStore(),
    account: "",
  }),
  getters: {
    getAccount(): string {
      return this.account;
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
      this.account = await this.commonStore.safeInfo.safeAddress;
      console.log("this.accounts=", this.account);
    },
  },
})
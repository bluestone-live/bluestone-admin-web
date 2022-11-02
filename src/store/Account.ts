import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
export const useAccountStore = defineStore('account', {
  state: () => ({
    isInited: false,
    commonStore: useCommonStore(),
    account: "",
    isOwner: false,
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
        await this.initOwnership()
        this.isInited = true
        console.log("[Account]: Account Store init success.")
      } catch (error) {
        console.log("[Account]: Account Store init failed.")
        console.error(error)
      }
    },
    async initAccounts() {
      this.account = await this.commonStore.safeInfo.safeAddress
      console.log("account=", this.account)
    },
    async initOwnership() {
      const owner = await this.commonStore.getProtocol.owner()
      this.isOwner = this.account.toLowerCase() === owner.toLowerCase()
    }
  },
})
import { defineStore } from 'pinia'
// import { MetaMaskProvider } from './MetaMaskStore'
import { useMetaMaskStore } from "./MetaMaskStore"

export const useAccountStore = defineStore('AccountStore', {
  state: () => ({
    // provider: new MetaMaskProvider(),
    accounts: null,
  }),
  getters: {
    account(state) {
      return state.accounts[0]
    }
  },
  actions: {
    initAccounts() {
      // return this.provider.ethers.send("eth_requestAccounts", []);
      this.accounts = useMetaMaskStore.ethersInstance.send("eth_requestAccounts", [])
    }
  },
})
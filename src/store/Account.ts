import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { WalletSelector } from '@/services/types'
export const useAccountStore = defineStore('account', {
  state: () => ({
    isInited: false,
    commonStore: useCommonStore(),
    preWallet: WalletSelector.MetaMask,
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
        this.initPreWallet()
        await this.initAccounts()
        this.isInited = true
        console.log("[Account]: Account Store init success.")
      } catch (error) {
        console.log("[Account]: Account Store init failed.")
        console.error(error)
      }
    },
    initPreWallet() {
      this.preWallet = this.commonStore.wallet as WalletSelector;
    },
    async initAccounts() {
      if (this.commonStore.wallet == WalletSelector.WalletConnect) {
        this.accounts = await this.commonStore.getWallectConnectProvider.enable();
        this.commonStore.setWallet(WalletSelector.WalletConnect)
      } else if (this.commonStore.wallet == WalletSelector.MetaMask) {
        this.accounts = await this.commonStore.getEthersProvider.send("eth_requestAccounts", []);
        this.commonStore.setWallet(WalletSelector.MetaMask)
      }
    },
    async disconnectWallet() {
      if(this.commonStore.wallet == WalletSelector.WalletConnect) {
        await this.commonStore.getWallectConnectProvider.disconnect();
      } 
      this.preWallet = this.commonStore.wallet as WalletSelector;
      this.commonStore.setWallet(WalletSelector.Disconnect);
    },
    async reconnectWallet() {
      if (this.preWallet == WalletSelector.WalletConnect) {
        this.accounts = await this.commonStore.getWallectConnectProvider.enable();
        this.commonStore.setWallet(WalletSelector.WalletConnect)
      } else if (this.preWallet == WalletSelector.MetaMask) {
        this.accounts = await this.commonStore.getEthersProvider.send("eth_requestAccounts", []);
        this.commonStore.setWallet(WalletSelector.MetaMask)
      }
    }
  },
})
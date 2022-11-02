import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { useAccountStore } from "./Account"
import { ethers, Contract } from 'ethers'
import { toRaw } from "@vue/reactivity"
import whitelistDeclareFile from "@/contracts/Whitelist.json"


export const useWhitelistStore = defineStore('whitelist', {
    state: () => ({
        isInited: false,
        isKeeper: false,
        commonState: useCommonStore(),
        accountStore: useAccountStore(),
        whitelistInstance: {} as Contract,
        // administrators: [],
        whitelistedKeepers: [],
        whitelistedLenders: [],
        whitelistedBorrowers: [],
    }),
    getters: {
        getWhitelistInstance(state) {
            return toRaw(state.whitelistInstance)
        },
    },
    actions: {
        async init() {
            try {
                this.initWhitelistInstance()
                await Promise.all([
                    // this.initAdministrators(),
                    this.initWhitelistedKeepers(),
                    this.initWhitelistedLenders(),
                    this.initWhitelistedBorrowers()
                ])
                this.initIsAccountKeeper()
                this.isInited = true
                console.log("[Whitelist]: Whitelist Store init success.")
            } catch (error) {
                console.log("[Whitelist]: Whitelist Store init failed.")
                console.error(error)
            }
        },
        initWhitelistInstance() {
            this.whitelistInstance = new ethers.Contract(
                this.commonState.protocolAddress,
                whitelistDeclareFile.abi,
                this.commonState.getEthersProvider.getSigner()
            )
        },
        // async initAdministrators() {
        //     const tempArr = await this.getWhitelistInstance.getAdministrators()
        //     this.administrators = tempArr
        // },
        async initWhitelistedKeepers() {
            const tempArr = await this.getWhitelistInstance.getWhitelistedKeepers()
            this.whitelistedKeepers = tempArr
        },
        async initWhitelistedLenders() {
            const tempArr = await this.getWhitelistInstance.getWhitelistedLenders()
            this.whitelistedLenders = tempArr
        },
        async initWhitelistedBorrowers() {
            const tempArr = await this.getWhitelistInstance.getWhitelistedBorrowers()
            this.whitelistedBorrowers = tempArr
        },
        async initIsAccountKeeper() {
            for (const address of (this.whitelistedKeepers as string[])) {
                if (address.toLowerCase() === this.accountStore.getAccount.toLowerCase()) {
                    this.isKeeper = true;
                    break;
                }
            }
        }
    }
})
import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { ethers, Contract } from 'ethers'
import { toRaw } from "@vue/reactivity"
import whitelistDeclareFile from "@/contracts/Whitelist.json"


export const useWhitelistStore = defineStore('whitelist', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        whitelistInstance: Contract,
        administrators: [],
        whitelistedLenders: [],
        whitelistedBorrowers: [],
    }),
    getters: {
        getInitStatus(state) {
            return state.isInited
        },
        getWhitelistInstance(state) {
            return toRaw(state.whitelistInstance)
        },
        getAdministrators(state) {
            return state.administrators
        },
        getWhitelistedLenders(state) {
            return state.whitelistedLenders
        },
        getWhitelistedBorrowers(state) {
            return state.whitelistedBorrowers
        },
    },
    actions: {
        async init() {
            try {
                this.initWhitelistInstance()
                await Promise.all([
                    this.initAdministrators(),
                    this.initWhitelistedLenders(),
                    this.initWhitelistedBorrowers()
                ])
                this.isInited = true
                console.log("[Whitelist]: Whitelist Store init success.")
            } catch (error) {
                console.log("[Whitelist]: Whitelist Store init failed.")
                console.error(error)
            }
        },
        initWhitelistInstance() {
            const whitelistAddress = this.commonState.getNetworkFile.contracts[whitelistDeclareFile.contractName]
            this.whitelistInstance = new ethers.Contract(
                whitelistAddress,
                whitelistDeclareFile.abi,
                this.commonState.getProvider.getSigner()
            )
        },
        async initAdministrators() {
            const tempArr = await this.getWhitelistInstance.getAdministrators()
            this.administrators = tempArr
            console.log("admin whitelist", tempArr)
        },
        async initWhitelistedLenders() {
            const tempArr = await this.getWhitelistInstance.getWhitelistedLenders()
            this.whitelistedLenders = tempArr
        },
        async initWhitelistedBorrowers() {
            const tempArr = await this.getWhitelistInstance.getWhitelistedBorrowers()
            this.whitelistedBorrowers = tempArr
        },
    }
})
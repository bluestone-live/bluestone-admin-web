import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"

export const useDepositStore = defineStore('DepositStore', {
    state: () => ({
        commonState: useCommonStore(),
        whitelists: [],
        sgcAddress: "",
        sgcPools: [],
        sgcBalance: 0,
        totalLoanOutstandingBalance: 0,
    }),
    getters: {
        getWhitelists(state) {
            return state.whitelists
        },
        getSgcPools(state) {
            return state.sgcPools
        },
        getSgcAddress(state) {
            return state.sgcAddress
        },
        getSgcBalance(state) {
            return state.sgcBalance
        },
        getTotalLoanOutstandingBalance(state) {
            return state.totalLoanOutstandingBalance
        },
    },
    actions: {
        async init() {
            await this.initWhitelists()
        },

        async initWhitelists() {
            // return useMetaMaskStore
        },

        initSgcAddress() {
            this.sgcAddress = this.commonState.getTokens.USDT.address
        },

        async initSgcPools() {
            this.sgcPools = await this.commonState.getProtocol.getPoolsByToken(this.sgcAddress)
        },

        initSgcBalance() {
            // const depositIndexTokenAddress = this.commonState.getProtocol.filters.DepositSuccessed(null, this.getSgcAddress)
            // const depositEvents = await this.commonState.getProtocol.queryFilter(depositIndexTokenAddress)

            // const withdrawIndexTokenAddress = this.commonState.getProtocol.filters.DepositSuccessed(null, this.getSgcAddress)
            // const withdrawEvents = await this.commonState.getProtocol.queryFilter(withdrawIndexTokenAddress)
            let totalBalance = 0
            this.sgcPools.forEach((pool) => {
                totalBalance += pool.availableAmount
            })
            this.sgcBalance = totalBalance
        },

        initTotalLoanOutstandingBalance() {
            let totalBalance = 0
            this.sgcPools.forEach((pool) => {
                totalBalance += pool.depositAmount - pool.availableAmount
            })
        }
    }
})
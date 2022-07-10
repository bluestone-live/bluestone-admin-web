import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { BigNumber } from "ethers"

export const useDepositStore = defineStore('DepositStore', {
    state: () => ({
        commonState: useCommonStore(),
        whitelists: [],
        sgcAddress: "",
        sgcPools: [],
        sgcBalance: BigNumber,
        totalLoanOutstandingBalance: BigNumber,
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
            return state.sgcBalance.toNumber()
        },
        getTotalLoanOutstandingBalance(state) {
            return state.totalLoanOutstandingBalance.toNumber()
        },
    },
    actions: {
        async init() {
            // await this.initWhitelists()
            this.initSgcAddress()
            await this.initSgcPools()
            this.initSgcBalance()
            this.initTotalLoanOutstandingBalance()
        },

        async initWhitelists() {
            // return useMetaMaskStore
        },

        initSgcAddress() {
            this.sgcAddress = this.commonState.getTokens.SGC.address
        },

        async initSgcPools() {
            this.sgcPools = await this.commonState.getProtocol.getPoolsByToken(this.sgcAddress)
            console.log("sgcPools=", this.sgcPools)
        },

        initSgcBalance() {
            let totalBalance = BigNumber.from(0)
            this.sgcPools.forEach((pool) => {
                totalBalance.add(pool.availableAmount)
            })
            this.sgcBalance = totalBalance
        },

        initTotalLoanOutstandingBalance() {
            let totalBalance = BigNumber.from(0)
            this.sgcPools.forEach((pool) => {
                totalBalance.add(pool.depositAmount.sub(pool.availableAmount))
            })
            this.totalLoanOutstandingBalance = totalBalance
        }
    }
})
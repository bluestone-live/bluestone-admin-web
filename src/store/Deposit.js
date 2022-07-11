import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { BigNumber } from "ethers"

export const useDepositStore = defineStore('DepositStore', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        whitelists: [],
        exp: BigNumber.from("10").pow(18),
        sgcAddress: "",
        sgcPools: [],
        availableSgcPools: [],
        sgcBalance: BigNumber,
        totalLoanOutstandingBalance: BigNumber,
    }),
    getters: {
        getInitStatus(state) {
            return state.isInited
        },
        getWhitelists(state) {
            return state.whitelists
        },
        getSgcPools(state) {
            return state.sgcPools
        },
        getAvailableSgcPools(state) {
            return state.availableSgcPools
        },
        getSgcAddress(state) {
            return state.sgcAddress
        },
        getSgcBalance(state) {
            return state.sgcBalance.div(this.exp).toNumber()
        },
        getTotalLoanOutstandingBalance(state) {
            return state.totalLoanOutstandingBalance.div(this.exp).toNumber()
        },
    },
    actions: {
        async init() {
            try {
                // await this.initWhitelists()
                this.initSgcAddress()
                await this.initSgcPools()
                this.initAvailableSgcPools()
                this.initSgcBalance()
                this.initTotalLoanOutstandingBalance()
                this.isInited = true
            } catch (error) {
                console.error(error)
            }
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

        initAvailableSgcPools() {
            let tempArr = []
            this.sgcPools.forEach((pool) => {
                let modifiedPool = {
                    poolId: "",
                    availableAmount: "",
                    depositAmount: "",
                    loanInterest: "",
                    totalDepositWeight: ""
                }
                if (pool.availableAmount.gt(BigNumber.from(0))) {
                    modifiedPool.poolId = pool.poolId.toNumber()
                    modifiedPool.availableAmount = pool.availableAmount.div(this.exp).toNumber()
                    modifiedPool.depositAmount = pool.depositAmount.div(this.exp).toNumber()
                    modifiedPool.loanInterest = pool.loanInterest.div(this.exp).toNumber()
                    modifiedPool.totalDepositWeight = pool.totalDepositWeight.div(this.exp).toNumber()
                    tempArr.push(modifiedPool)
                }
            })
            console.log(tempArr)
            this.availableSgcPools = tempArr
        },

        initSgcBalance() {
            let a = BigNumber.from(0)
            let b = BigNumber.from(1)
            let c = a.add(b)
            console.log(a, b, c)
            let totalBalance = BigNumber.from(0)
            this.sgcPools.forEach((pool) => {
                // if(pool.availableAmount.gt(BigNumber.from(0))) {
                //     console.log("non-zero pool=", pool)
                //     console.log("totalBalance=", totalBalance)
                // }
                totalBalance = totalBalance.add(pool.availableAmount)
            })
            this.sgcBalance = totalBalance
        },

        initTotalLoanOutstandingBalance() {
            let totalBalance = BigNumber.from(0)
            this.sgcPools.forEach((pool) => {
                totalBalance = totalBalance.add(pool.depositAmount.sub(pool.availableAmount))
            })
            this.totalLoanOutstandingBalance = totalBalance
        }
    }
})
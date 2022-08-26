import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { BigNumber } from "ethers"
import { IPool } from "@/services/types"

export const useDepositStore = defineStore('deposit', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        whitelists: [],
        exp: BigNumber.from("10").pow(18),
        sgcAddress: "",
        sgcPools: [] as IPool[],
        availableSgcPools: [],
        sgcBalance: BigNumber.from("0"),
        totalLoanOutstandingBalance: BigNumber.from("0"),
    }),
    getters: {
        getSgcBalance(): Number {
            return this.sgcBalance.mul(10000).div(this.exp).toNumber() / 10000
        },
        getTotalLoanOutstandingBalance(): Number {
            return this.totalLoanOutstandingBalance.mul(10000).div(this.exp).toNumber() / 10000
        },
    },
    actions: {
        async init() {
            try {
                this.initSgcAddress()
                await this.initSgcPools()
                this.initSgcBalance()
                this.initTotalLoanOutstandingBalance()
                this.isInited = true
                console.log("[Deposit]: Deposit Store init success.")
            } catch (error) {
                console.log("[Deposit]: Deposit Store init failed.")
                console.error(error)
            }
        },

        initSgcAddress() {
            this.sgcAddress = this.commonState.getTokens.SGC.address
        },

        async initSgcPools() {
            this.sgcPools = await this.commonState.getProtocol.getPoolsByToken(this.sgcAddress)
        },

        initSgcBalance() {
            let a = BigNumber.from(0)
            let b = BigNumber.from(1)
            let c = a.add(b)
            console.log(a, b, c)
            let totalBalance = BigNumber.from(0)
            this.sgcPools.forEach((pool) => {
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
import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"

export const useLoanStore = defineStore('LoanStore', {
    state: () => ({
        commonState: useCommonStore(),
        whitelists: [],
        btcAddress: "",
        ethAddress: "",
        btcBalance: 0,
        ethBalance: 0,
        borrowers: [],
        borrowersLoanRecords: [],
    }),
    getters: {
        getWhitelists(state) {
            return state.whitelists
        },
        getBtcAddress(state) {
            return state.btcAddress
        },
        getEthAddress(state) {
            return state.ethAddress
        },
        getBtcBalance(state) {
            return state.btcBalance
        },
        getEthBalance(state) {
            return state.ethBalance
        },
        getBorrowers(state) {
            return state.borrowers
        }
    },
    actions: {
        async initWhitelists() {
            // TODO
        },

        initBtcAddress() {
            this.btcAddress = this.commonState.getTokens.BTC.address
        },
        initEthAddress() {
            this.ethAddress = this.commonState.getTokens.ETH.address
        },

        async initBtcBalance() {
            const btcPools = await this.commonState.getProtocol.getPoolsByToken(this.sgcAddress)
            let totalBalance = 0
            btcPools.forEach((pool) => {
                totalBalance += pool.availableAmount
            })
            this.btcBalance = totalBalance
        },

        async initEthBalance() {
            const ethBalance = await this.commonState.getProtocol.getPoolsByToken(this.sgcAddress)
            let totalBalance = 0
            ethBalance.forEach((pool) => {
                totalBalance += pool.availableAmount
            })
            this.ethBalance = totalBalance
        },

        async initBorrowers() {

        },

        async initBorrowersLoanRecord() {
            let tempArr = []
            await Promise.all(this.borrowers.map(async (borrowerAddress)=>{
                let tempData = await this.commonState.getProtocol.getLoanRecordsByAccount(borrowerAddress)
                tempArr.push(tempData)
            }))
            this.borrowersLoanRecords = tempArr
        }
    }
})
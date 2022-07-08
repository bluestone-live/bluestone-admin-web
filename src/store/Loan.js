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
        activeBorrowers: [],
        borrowersLoanRecords: Map,
        marginCallBorrowers: [],
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
        },
        getActiveBorrowers(state) {
            return state.borrowers
        },
        getMarginCallBorrowers(state) {
            return state.marginCallBorrowers
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
            let tempMap = new Map()
            await Promise.all(this.borrowers.map(async (borrowerAddress) => {
                let tempData = await this.commonState.getProtocol.getLoanRecordsByAccount(borrowerAddress)
                tempMap.set(borrowerAddress, tempData)
            }))
            this.borrowersLoanRecords = tempMap
        },

        initActiveBorrowers() {
            let tempArr = []
            this.borrowersLoanRecords.forEach((value, key) => {
                if(!value.isClosed) {
                    tempArr.push(key)
                }
            })
        },

        initMarginCallBorrowers() {
            
        }
    }
})
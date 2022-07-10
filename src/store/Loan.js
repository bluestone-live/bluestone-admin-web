import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { marginLimit } from "@/margin"
import { BigNumber } from "ethers"
import { toRaw } from "@vue/reactivity"


export const useLoanStore = defineStore('LoanStore', {
    state: () => ({
        commonState: useCommonStore(),
        whitelists: [],
        btcAddress: "",
        ethAddress: "",
        btcBalance: BigNumber,
        ethBalance: BigNumber,
        totalLoansCount: 0,
        activeLoansCount: 0,
        marginCallLoansCount: 0,
        liquidatedLoans: 0,
        borrowers: [],
        borrowersLoanRecords: Map,
        activeBorrowers: [],
        marginCallLoansCount: 0,
        liquidatedLoansCount: 0
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
            return state.btcBalance.toNumber()
        },
        getEthBalance(state) {
            return state.ethBalance.toNumber()
        },
        getTotalLoansCount(state) {
            return state.totalLoansCount
        },
        getActiveLoansCount(state) {
            return state.activeLoansCount
        },
        getBorrowers(state) {
            return state.borrowers
        },
        getBorrowersLoanRecords(state) {
            return toRaw(state.borrowersLoanRecords)
        },
        getActiveBorrowers(state) {
            return toRaw(state.activeBorrowers)
        },
        getMarginCallLoansCount(state) {
            return state.marginCallLoansCount
        },
        getLiquidatedLoansCount(state) {
            return toRaw(state.liquidatedLoansCount)
        }
    },
    actions: {
        async init() {
            this.initBtcAddress()
            this.initBtcBalance()
            this.initEthAddress()
            this.initEthBalance()
            await this.initBorrowersAndTotalLoansCount()
            await this.initBorrowersLoanRecords()
            this.initLiquidatedLoansCount()
            this.initActiveBorrowersAndActiveLoansCount()
            // this.initMarginCallLoansCount()
        },
        async initWhitelists() {
            // TODO
        },

        initBtcAddress() {
            console.log("Loan: getTokens=", this.commonState.getTokens)
            this.btcAddress = this.commonState.getTokens.xBTC.address
        },
        initEthAddress() {
            this.ethAddress = this.commonState.getTokens.ETH.address
        },

        async initBtcBalance() {
            const btcPools = await this.commonState.getProtocol.getPoolsByToken(this.btcAddress)
            console.log("btcPools=", btcPools)
            let totalBalance = BigNumber.from(0)
            btcPools.forEach((pool) => {
                totalBalance.add(pool.availableAmount)
            })
            this.btcBalance = totalBalance
            console.log("btcBalance=", this.btcBalance)
        },

        async initEthBalance() {
            const ethPools = await this.commonState.getProtocol.getPoolsByToken(this.ethAddress)
            console.log("ethPools=", ethPools)
            let totalBalance = BigNumber.from(0)
            ethPools.forEach((pool) => {
                totalBalance.add(pool.availableAmount)
            })
            this.ethBalance = totalBalance
            console.log("ethBalance=", this.ethBalance)
        },

        async initBorrowersAndTotalLoansCount() {
            let tempArr = []
            let filter = this.commonState.getProtocol.filters.LoanSucceed()
            const loanEvents = await this.commonState.getProtocol.queryFilter(filter)
            this.totalLoansCount = loanEvents.length
            console.log("loanEvents=", loanEvents)
            loanEvents.forEach((event) => {
                tempArr.push(event.args.accountAddress)
            })
            console.log("before borrowers=", tempArr)
            this.borrowers = [...new Set(tempArr)]
            console.log("borrowers=", this.borrowers)
        },

        async initBorrowersLoanRecords() {
            let tempMap = new Map()
            await Promise.all(this.borrowers.map(async (borrowerAddress) => {
                let tempData = await this.commonState.getProtocol.getLoanRecordsByAccount(borrowerAddress)
                console.log("borrowersLoanRecord tempdata:", tempData)
                tempMap.set(borrowerAddress, tempData)
            }))
            this.borrowersLoanRecords = tempMap
            console.log("borrowersRecord=", this.borrowersLoanRecords)
        },

        initActiveBorrowersAndActiveLoansCount() {
            let tempArr = []
            let tempCount = 0
            this.getBorrowersLoanRecords.forEach((loanRecordsArr, borrowerAddress) => {
                // let idxArr = []
                loanRecordsArr.forEach((loanRecord, loanIdx) => {
                    if (!loanRecord.isClosed) {
                        // idxArr.push(loanIdx)
                        tempCount++
                    }
                })
                // tempCount += idxArr.length
                // tempMap.set(borrowerAddress, tempArr)
                tempArr.push(borrowerAddress)
            })
            this.activeBorrowers = tempArr
            this.activeLoansCount = tempCount
            console.log("activeBorrowers=", this.activeBorrowers)
        },

        initMarginCallLoansCount() {
            let tempArr = []
            this.getActiveBorrowers.forEach((loanArrIdx, borrowerAddress) => {
                if (this.getBorrowersLoanRecords[borrowerAddress][loanArrIdx].remainingDebt.lte(marginLimit)) {
                    tempArr.push(borrowerAddress)
                }
            })
            this.marginCallBorrowers = tempArr
        },

        async initLiquidatedLoansCount() {
            // let tempArr = []
            let filter = this.commonState.getProtocol.filters.LiquidateLoanSucceed()
            const liquidateEvents = await this.commonState.getProtocol.queryFilter(filter)
            console.log("liquidate events=", liquidateEvents)
            // liquidateEvents.forEach((event) => {
            //     tempArr.push(event.args.accountAddress)
            // })
            // this.liquidatedBorrowers = tempArr
            // console.log("liquidatedBorrowers=", this.liquidatedBorrowers)
            this.liquidatedLoansCount = liquidateEvents.length
        }
    }
})
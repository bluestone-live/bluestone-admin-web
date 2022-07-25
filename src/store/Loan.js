import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { marginCollateralCoverageRatio } from "@/margin"
import { BigNumber, ethers } from "ethers"
import { toRaw } from "@vue/reactivity"
import borrowerWhitelistDeclareFile from "@/contracts/BorrowersWhitelist.json"


export const useLoanStore = defineStore('LoanStore', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        whitelistInstance: null,
        whitelist: [],
        btcAddress: "",
        ethAddress: "",
        exp: BigNumber.from("10").pow(18),
        btcBalance: BigNumber,
        ethBalance: BigNumber,
        totalLoansCount: 0,
        activeLoansCount: 0,
        liquidableLoans: 0,
        borrowers: [],
        borrowersLoanRecords: Map,
        handledLoanRecords: Map,
        activeBorrowers: [],
        marginCallLoansCount: 0,
        liquidableLoansCount: 0
    }),
    getters: {
        getInitStatus(state) {
            return state.isInited
        },
        getExp(state) {
            return state.exp
        },
        getWhitelistInstance(state) {
            return toRaw(state.whitelistInstance)
        },
        getWhitelist(state) {
            return state.whitelist
        },
        getBtcAddress(state) {
            return state.btcAddress
        },
        getEthAddress(state) {
            return state.ethAddress
        },
        getBtcBalance(state) {
            return state.btcBalance.div(this.exp).toNumber()
        },
        getEthBalance(state) {
            return state.ethBalance.div(this.exp).toNumber()
        },
        getTotalLoansCount(state) {
            return state.totalLoansCount
        },
        getActiveLoansCount(state) {
            return state.activeLoansCount
        },
        getBorrowers(state) {
            return toRaw(state.borrowers)
        },
        getBorrowersLoanRecords(state) {
            return toRaw(state.borrowersLoanRecords)
        },
        getHandledLoanRecords(state) {
            return toRaw(state.handledLoanRecords)
        },
        getActiveBorrowers(state) {
            return toRaw(state.activeBorrowers)
        },
        getMarginCallLoansCount(state) {
            return state.marginCallLoansCount
        },
        getLiquidableLoansCount(state) {
            return state.liquidableLoansCount
        }
    },
    actions: {
        async init() {
            try {
                this.initWhitelistInstance()
                await this.initWhitelist()
                this.initBtcAddress()
                this.initBtcBalance()
                this.initEthAddress()
                this.initEthBalance()
                await this.initBorrowersAndTotalLoansCount()
                await this.initBorrowersLoanRecords()
                this.initHandledLoanRecords()
                this.initActiveBorrowersAndActiveLoansCount()
                this.initMarginCallAndLiquidableLoansCount()
                this.isInited = true
            } catch (error) {
                console.error(error)
            }
        },
        initWhitelistInstance() {
            const whitelistAddress = this.commonState.getNetworkFile.contracts[borrowerWhitelistDeclareFile.contractName]
            this.whitelistInstance = new ethers.Contract(
                whitelistAddress,
                borrowerWhitelistDeclareFile.abi,
                this.commonState.getProvider.getSigner()
            )
        },
        async initWhitelist() {
            let tempArr = []
            tempArr = await this.getWhitelistInstance.getWhitelistedAccounts()
            this.whitelist = tempArr
            console.log("[Loan]: tempArr", tempArr)
            console.log("[Loan]: getWhitelist", this.getWhitelist)
            console.log("[Loan]: whitelist", this.whitelist)
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
                totalBalance = totalBalance.add(pool.availableAmount)
            })
            this.btcBalance = totalBalance
            console.log("btcBalance=", this.btcBalance)
        },

        async initEthBalance() {
            const ethPools = await this.commonState.getProtocol.getPoolsByToken(this.ethAddress)
            console.log("ethPools=", ethPools)
            let totalBalance = BigNumber.from(0)
            ethPools.forEach((pool) => {
                totalBalance = totalBalance.add(pool.availableAmount)
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

        initHandledLoanRecords() {
            let tempMap = new Map()
            let date = new Date()
            this.getBorrowersLoanRecords.forEach((loanRecords, address) => {
                let tempRecords = []
                loanRecords.forEach((loanRecord) => {
                    let tempRecord = {
                        loanId: loanRecord.loanId,
                        loanTokenAddress: loanRecord.loanTokenAddress,
                        collateralTokenAddress: loanRecord.collateralTokenAddress,
                        loanAmount: loanRecord.loanAmount.div(this.exp).toNumber(),
                        collateralAmount: loanRecord.collateralAmount.div(this.exp).toNumber(),
                        loanTerm: loanRecord.loanTerm.toNumber(),
                        annualInterestRate: loanRecord.annualInterestRate.div(this.exp).toNumber(),
                        interest: loanRecord.interest.div(this.exp).toNumber(),
                        collateralCoverageRatio: loanRecord.collateralCoverageRatio.div(this.exp).toNumber(),
                        minCollateralCoverageRatio: loanRecord.minCollateralCoverageRatio.div(this.exp).toNumber(),
                        alreadyPaidAmount: loanRecord.alreadyPaidAmount.div(this.exp).toNumber(),
                        liquidatedAmount: loanRecord.liquidatedAmount.div(this.exp).toNumber(),
                        soldCollateralAmount: loanRecord.soldCollateralAmount.div(this.exp).toNumber(),
                        createdAt: loanRecord.createdAt.toNumber(),
                        dueAt: loanRecord.dueAt.toNumber(),
                        remainingDebt: loanRecord.remainingDebt.div(this.exp).toNumber(),
                        isClosed: loanRecord.isClosed,
                        isMarginCall: (!loanRecord.isClosed) && loanRecord.collateralCoverageRatio.lte(marginCollateralCoverageRatio),
                        isLiquidable: (!loanRecord.isClosed) && (loanRecord.collateralCoverageRatio.lt(loanRecord.minCollateralCoverageRatio) || loanRecord.dueAt.mul(1000).lt(BigNumber.from(date.getTime())))
                    }
                    tempRecords.push(tempRecord)
                })
                tempMap.set(address, tempRecords)
            })
            this.handledLoanRecords = tempMap
            console.log("handledLoanRecords=", this.handledLoanRecords)
        },

        initActiveBorrowersAndActiveLoansCount() {
            let tempArr = []
            let tempCount = 0
            this.getBorrowersLoanRecords.forEach((loanRecordsArr, borrowerAddress) => {
                let activeFlag = false
                loanRecordsArr.forEach((loanRecord, loanIdx) => {
                    if (!loanRecord.isClosed) {
                        tempCount++
                        activeFlag = true
                    }
                })
                if (activeFlag === true) {
                    tempArr.push(borrowerAddress)
                }
            })
            this.activeBorrowers = tempArr
            this.activeLoansCount = tempCount
            console.log("activeBorrowers=", this.activeBorrowers)
        },

        initMarginCallAndLiquidableLoansCount() {
            let tempMarginCallCount = 0
            let tempLiquidableCount = 0
            this.getHandledLoanRecords.forEach((loanRecords, address) => {
                loanRecords.forEach((loanRecord) => {
                    if (loanRecord.isMarginCall) {
                        tempMarginCallCount++
                    }
                    if (loanRecord.isLiquidable) {
                        tempLiquidableCount++
                    }
                })
            })
            this.marginCallLoansCount = tempMarginCallCount
            this.liquidableLoansCount = tempLiquidableCount
        },

        // async initLiquidableLoansCount() {
        //     // let filter = this.commonState.getProtocol.filters.LiquidateLoanSucceed()
        //     // const liquidateEvents = await this.commonState.getProtocol.queryFilter(filter)
        //     // console.log("liquidate events=", liquidateEvents)
        //     // this.liquidatedLoansCount = liquidateEvents.length
        //     let tempCount = 0
        //     this.get
        // }
    }
})
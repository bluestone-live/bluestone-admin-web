import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { marginCollateralCoverageRatio } from "@/margin"
import { BigNumber, ethers } from "ethers"
import { toRaw } from "@vue/reactivity"
import utils from "@/utils"
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
                // this.initHandledLoanRecords()
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
        },
        initBtcAddress() {
            this.btcAddress = this.commonState.getTokens.xBTC.address
        },
        initEthAddress() {
            this.ethAddress = this.commonState.getTokens.ETH.address
        },

        async initBtcBalance() {
            const btcPools = await this.commonState.getProtocol.getPoolsByToken(this.btcAddress)
            let totalBalance = BigNumber.from(0)
            btcPools.forEach((pool) => {
                totalBalance = totalBalance.add(pool.availableAmount)
            })
            this.btcBalance = totalBalance
        },

        async initEthBalance() {
            const ethPools = await this.commonState.getProtocol.getPoolsByToken(this.ethAddress)
            let totalBalance = BigNumber.from(0)
            ethPools.forEach((pool) => {
                totalBalance = totalBalance.add(pool.availableAmount)
            })
            this.ethBalance = totalBalance
        },

        async initBorrowersAndTotalLoansCount() {
            let tempArr = []
            let filter = this.commonState.getProtocol.filters.LoanSucceed()
            const loanEvents = await this.commonState.getProtocol.queryFilter(filter)
            this.totalLoansCount = loanEvents.length
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
                tempMap.set(borrowerAddress, tempData)
            }))
            this.borrowersLoanRecords = tempMap
            console.log("borrowersRecord=", this.borrowersLoanRecords)
        },

        // initHandledLoanRecords() {
        //     let tempMap = new Map()
        //     let date = new Date()
        //     this.getBorrowersLoanRecords.forEach((loanRecords, address) => {
        //         let tempRecords = []
        //         loanRecords.forEach((loanRecord) => {
        //             let tempRecord = {
        //                 loanId: loanRecord.loanId,
        //                 loanTokenAddress: loanRecord.loanTokenAddress,
        //                 collateralTokenAddress: loanRecord.collateralTokenAddress,
        //                 loanAmount: loanRecord.loanAmount.div(this.exp).toNumber() + " SGC",
        //                 collateralAmount: loanRecord.collateralAmount.div(this.exp).toNumber() + " SGC",
        //                 loanTerm: loanRecord.loanTerm.toNumber() + " Days",
        //                 annualInterestRate: loanRecord.annualInterestRate.div(this.exp).mul(100).toNumber() + "%",
        //                 interest: loanRecord.interest.div(this.exp).toNumber() + " SGC",
        //                 collateralCoverageRatio: loanRecord.collateralCoverageRatio.div(this.exp).mul(100).toNumber() + "%",
        //                 minCollateralCoverageRatio: loanRecord.minCollateralCoverageRatio.div(this.exp).mul(100).toNumber() + "%",
        //                 alreadyPaidAmount: loanRecord.alreadyPaidAmount.div(this.exp).toNumber() + " SGC",
        //                 liquidatedAmount: loanRecord.liquidatedAmount.div(this.exp).toNumber() + " SGC",
        //                 soldCollateralAmount: loanRecord.soldCollateralAmount.div(this.exp).toNumber() + " SGC",
        //                 createdAt: utils.formatTimestamp(loanRecord.createdAt.toNumber()),
        //                 dueAt: utils.formatTimestamp(loanRecord.dueAt.toNumber()),
        //                 remainingDebt: loanRecord.remainingDebt.div(this.exp).toNumber() + " SGC",
        //                 isClosed: loanRecord.isClosed,
        //                 isMarginCall: (!loanRecord.isClosed) && loanRecord.collateralCoverageRatio.lte(marginCollateralCoverageRatio),
        //                 isLiquidable: (!loanRecord.isClosed) && (loanRecord.collateralCoverageRatio.lt(loanRecord.minCollateralCoverageRatio) || loanRecord.dueAt.mul(1000).lt(BigNumber.from(date.getTime())))
        //             }
        //             tempRecords.push(tempRecord)
        //         })
        //         tempMap.set(address, tempRecords)
        //     })
        //     this.handledLoanRecords = tempMap
        //     console.log("handledLoanRecords=", this.handledLoanRecords)
        // },

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
        },

        initMarginCallAndLiquidableLoansCount() {
            let tempMarginCallCount = 0
            let tempLiquidableCount = 0
            // this.getHandledLoanRecords.forEach((loanRecords, address) => {
            //     loanRecords.forEach((loanRecord) => {
            //         if (loanRecord.isMarginCall) {
            //             tempMarginCallCount++
            //         }
            //         if (loanRecord.isLiquidable) {
            //             tempLiquidableCount++
            //         }
            //     })
            // })
            let date = new Date()
            this.getBorrowersLoanRecords.forEach((loanRecords, address) => {
                loanRecords.forEach((loanRecord) => {
                    if ((!loanRecord.isClosed) && loanRecord.collateralCoverageRatio.lte(marginCollateralCoverageRatio)) {
                        tempMarginCallCount++
                    }
                    if ((!loanRecord.isClosed) && (loanRecord.collateralCoverageRatio.lt(loanRecord.minCollateralCoverageRatio) || loanRecord.dueAt.mul(1000).lt(BigNumber.from(date.getTime())))) {
                        tempLiquidableCount++
                    }
                })
            })
            this.marginCallLoansCount = tempMarginCallCount
            this.liquidableLoansCount = tempLiquidableCount
        },
    }
})
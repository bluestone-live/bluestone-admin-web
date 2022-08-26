import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { marginCollateralCoverageRatio } from "@/margin"
import { BigNumber } from "ethers"
import { toRaw } from "@vue/reactivity"
import { IPool, ILoanRecord } from "@/services/types"

export const useLoanStore = defineStore('loan', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        btcAddress: "",
        ethAddress: "",
        exp: BigNumber.from("10").pow(18),
        btcBalance: BigNumber.from("0"),
        ethBalance: BigNumber.from("0"),
        totalLoansCount: 0,
        activeLoansCount: 0,
        liquidableLoans: 0,
        borrowers: [] as string[],
        borrowersLoanRecords: new Map(),
        activeBorrowers: [] as string[],
        marginCallLoansCount: 0,
        liquidableLoansCount: 0
    }),
    getters: {
        getBtcBalance(): Number {
            return this.btcBalance.div(this.exp).toNumber()
        },
        getEthBalance(): Number {
            return this.ethBalance.div(this.exp).toNumber()
        },
        getBorrowers(): string[] {
            return toRaw(this.borrowers)
        },
        getBorrowersLoanRecords(): Map<string, ILoanRecord[]> {
            return toRaw(this.borrowersLoanRecords)
        },
        getActiveBorrowers(): string[] {
            return toRaw(this.activeBorrowers)
        },
    },
    actions: {
        async init() {
            try {
                // this.initBtcAddress()
                // this.initBtcBalance()
                // this.initEthAddress()
                // this.initEthBalance()
                await this.initBorrowersAndTotalLoansCount()
                await this.initBorrowersLoanRecords()
                this.initActiveBorrowersAndActiveLoansCount()
                this.initMarginCallAndLiquidableLoansCount()
                this.isInited = true
                console.log("[Loan]: Loan Store init success.")
            } catch (error) {
                console.log("[Loan]: Loan Store init failed.")
                console.error(error)
            }
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
            btcPools.forEach((pool: IPool) => {
                totalBalance = totalBalance.add(pool.availableAmount)
            })
            this.btcBalance = totalBalance
        },

        async initEthBalance() {
            const ethPools = await this.commonState.getProtocol.getPoolsByToken(this.ethAddress)
            let totalBalance = BigNumber.from(0)
            ethPools.forEach((pool: IPool) => {
                totalBalance = totalBalance.add(pool.availableAmount)
            })
            this.ethBalance = totalBalance
        },

        async initBorrowersAndTotalLoansCount() {
            let tempArr = [] as string[]
            let filter = this.commonState.getProtocol.filters.LoanSucceed()
            const loanEvents = await this.commonState.getProtocol.queryFilter(filter)
            this.totalLoansCount = loanEvents.length
            loanEvents.forEach((event) => {
                tempArr.push((event as any).args.accountAddress)
            })
            this.borrowers = [...new Set(tempArr)]
        },

        async initBorrowersLoanRecords() {
            let tempMap: Map<string, ILoanRecord[]> = new Map()
            await Promise.all(this.borrowers.map(async (borrowerAddress) => {
                let tempData = await this.commonState.getProtocol.getLoanRecordsByAccount(borrowerAddress)
                tempMap.set(borrowerAddress, tempData)
            }))
            this.borrowersLoanRecords = tempMap
        },

        initActiveBorrowersAndActiveLoansCount() {
            let tempArr = [] as string[]
            let tempCount = 0
            this.getBorrowersLoanRecords.forEach((loanRecordsArr: ILoanRecord[], borrowerAddress: string) => {
                let activeFlag: boolean = false
                loanRecordsArr.forEach((loanRecord, loanIdx) => {
                    if (!loanRecord.isClosed) {
                        tempCount++
                        activeFlag = true
                    }
                })
                if (activeFlag) {
                    tempArr.push(borrowerAddress)
                }
            })
            this.activeBorrowers = tempArr
            this.activeLoansCount = tempCount
        },

        initMarginCallAndLiquidableLoansCount() {
            let tempMarginCallCount = 0
            let tempLiquidableCount = 0
            let date = new Date()
            this.getBorrowersLoanRecords.forEach((loanRecordsArr: ILoanRecord[], address: string) => {
                loanRecordsArr.forEach((loanRecord: ILoanRecord) => {
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
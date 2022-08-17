import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { useLoanStore } from './Loan'
import { BigNumber } from "ethers"
import { useDepositStore } from './Deposit'


export const useOracleStore = defineStore('oracle', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        loanStore: useLoanStore(),
        depositStore: useDepositStore(),
        btcPrice: BigNumber.from("0"),
        ethPrice: BigNumber.from("0"),
        sgcPrice: BigNumber.from("0"),
        exp: BigNumber.from("10").pow(18),
    }),
    getters: {
        getBtcPrice(): Number {
            return this.btcPrice.div(this.exp).toNumber()
        },
        getEthPrice(): Number {
            return this.ethPrice.div(this.exp).toNumber()
        },
        getSgcPrice(): Number {
            return this.sgcPrice.toNumber()
        }
    },
    actions: {
        async init() {
            try {
                await Promise.all([
                    this.initBtcPrice(),
                    this.initEthPrice(),
                    this.initSgcPrice()
                ])
                // console.log("btcPrice=", this.getBtcPrice)
                // console.log("ethPrice=", this.getEthPrice)
                // console.log("sgcPrice=", this.sgcPrice)
                this.isInited = true
                console.log("[Oracle]: Oracle Store init success.")
            } catch (error) {
                console.log("[Oracle]: Oracle Store init failed.")
                console.error(error)
            }
        },

        async initBtcPrice() {
            this.btcPrice = await this.commonState.getProtocol.getTokenPrice(this.loanStore.btcAddress)
        },
        async initEthPrice() {
            this.ethPrice = await this.commonState.getProtocol.getTokenPrice(this.loanStore.ethAddress)
        },
        async initSgcPrice() {
            this.sgcPrice = BigNumber.from("1")
            // this.sgcPrice = await this.commonState.getProtocol.getTokenPrice(this.loanStore.getSgcAddress)
        },
    }
})
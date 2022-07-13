import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { useLoanStore } from './Loan'
import { BigNumber } from "ethers"
import { useDepositStore } from './Deposit'


export const useOracleStore = defineStore('OracleStore', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        loanStore: useLoanStore(),
        depositStore: useDepositStore(),
        btcPrice: BigNumber,
        ethPrice: BigNumber,
        sgcPrice: BigNumber,
        exp: BigNumber.from("10").pow(18),
    }),
    getters: {
        getInitStatus(state) {
            return state.isInited
        },
        getBtcPrice(state) {
            return state.btcPrice.div(this.exp).toNumber()
        },
        getEthPrice(state) {
            return state.ethPrice.div(this.exp).toNumber()
        },
        getSgcPrice(state) {
            return state.sgcPrice.toNumber()
            // return state.sgcPrice.div(this.exp).toNumber()
        }
    },
    actions: {
        async init() {
            try {
                if (!this.isInited) {
                    await Promise.all([
                        this.initBtcPrice(),
                        this.initEthPrice(),
                        this.initSgcPrice()
                    ])
                    console.log("btcPrice=", this.getBtcPrice)
                    console.log("ethPrice=", this.getEthPrice)
                    console.log("sgcPrice=", this.sgcPrice)
                    this.isInited = true
                }
            } catch (error) {
                console.error(error)
            }
        },

        async initBtcPrice() {
            this.btcPrice = await this.commonState.getProtocol.getTokenPrice(this.loanStore.getBtcAddress)
        },
        async initEthPrice() {
            this.ethPrice = await this.commonState.getProtocol.getTokenPrice(this.loanStore.getEthAddress)
        },
        async initSgcPrice() {
            this.sgcPrice = BigNumber.from("1")
            // this.sgcPrice = await this.commonState.getProtocol.getTokenPrice(this.loanStore.getSgcAddress)
        },
    }
})
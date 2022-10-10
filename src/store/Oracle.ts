import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { BigNumber } from "ethers"


export const useOracleStore = defineStore('oracle', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        btcPrice: BigNumber.from("0"),
        ethPrice: BigNumber.from("0"),
        sgcPrice: BigNumber.from("0"),
        exp: BigNumber.from("10").pow(18),
        precision: BigNumber.from("10").pow(4),
    }),
    getters: {
        getBtcPrice(): number {
            return this.btcPrice.div(this.exp.div(this.precision)).toNumber() / 10000
        },
        getEthPrice(): number {
            return this.ethPrice.div(this.exp.div(this.precision)).toNumber() / 10000
        },
        getSgcPrice(): number {
            return this.sgcPrice.div(this.exp).toNumber()
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
                this.isInited = true
                console.log("[Oracle]: Oracle Store init success.")
            } catch (error) {
                console.log("[Oracle]: Oracle Store init failed.")
                console.error(error)
            }
        },

        async initBtcPrice() {
            this.btcPrice = await this.commonState.getProtocol.getTokenPrice(this.commonState.getTokens.xBTC.address)
        },
        async initEthPrice() {
            this.ethPrice = await this.commonState.getProtocol.getTokenPrice(this.commonState.getTokens.ETH.address)
        },
        async initSgcPrice() {
            this.sgcPrice = this.exp;
            // this.sgcPrice = await this.commonState.getProtocol.getTokenPrice(this.commonState.getTokens.SGC.address)
        },
    }
})
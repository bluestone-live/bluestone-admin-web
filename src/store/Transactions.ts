import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { Contract } from 'ethers'
import axios from 'axios'
import { NetworkType } from '@/services/types'
import { toRaw } from 'vue'
import protocolDeclareFile from "@/contracts/Protocol.json"
import mappingDeclareFile from "@/contracts/MappingInterestRateModel.json"
import whitelistDeclareFile from "@/contracts/Whitelist.json"
const InputDataDecoder = require('ethereum-input-data-decoder')

export const useTransactionsStore = defineStore('transactions', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        safeInstance: {} as Contract,
        networkNameForSafeAPI: "unknown",
        transactions: [] as any,
        executedTransactionsIndex: 0,
        needUpdate: false,
        decoder: {} as any,
        timer: {} as any,
    }),
    getters: {
        getSafeAddress(state) {
            return state.commonState.getSafeInfo?.safeAddress
        },

        getAdministrators(state) {
            return state.commonState.getSafeInfo?.owners
        },

        getRawTransactions(state) {
            return toRaw(state.transactions)
        }
    },
    actions: {
        async init() {
            try {
                this.initDecoder()
                this.initNetworkNameForSafeAPI()
                await this.initTransactions()
                this.initTimer()
                this.isInited = true
                console.log("[Transactions]: Transactions Store init success.")
            } catch (error) {
                console.log("[Transactions]: Transactions Store init failed.")
                console.error(error)
            }
        },

        initDecoder() {
            this.decoder = new InputDataDecoder(
                [...protocolDeclareFile.abi, ...mappingDeclareFile.abi, ...whitelistDeclareFile.abi]
            )
        },

        initNetworkNameForSafeAPI() {
            switch (this.commonState.networkType) {
                case NetworkType.Main:
                    this.networkNameForSafeAPI = "mainnet"
                    break
                case NetworkType.Goerli:
                    this.networkNameForSafeAPI = "goerli"
                    break
                default:
                    return 
            }
        },

        _initExecutedTransactionsIndex() {
            for (let i in this.transactions) {
                if (!this.transactions[i].isExecuted) {
                    this.executedTransactionsIndex = parseInt(i)
                }
            }
        },

        async initTransactions() {
            console.log("initTransactions")

            const requestStr = this._genSafeAPI()
            try {
                const response = await axios.get(requestStr)
                this.transactions = this._filterTransactions(response.data.results)
                this._initExecutedTransactionsIndex()
                this.needUpdate = false
            } catch (error) {
                console.error(error)
            }
        },

        initTimer() {
            this.timer = setInterval(
                this.checkUpdate,
                8000
            )
        },

        async checkUpdate() {
            const requestStr = this._genSafeAPI("?executed=false")

            try {
                const response = await axios.get(requestStr)
                const executedTransactions = this._filterTransactions(response.data.results)
                if (executedTransactions.length - 1 !== this.executedTransactionsIndex) {
                    console.log(`${executedTransactions.length - 1} !== ${this.executedTransactionsIndex}`)
                    console.log("length inequal")
                    this.needUpdate = true
                } else {
                    for(let i in executedTransactions) {
                        if(JSON.stringify(executedTransactions[i]) !== JSON.stringify(this.transactions[i])) {
                            console.log("state changed")
                            this.needUpdate = true
                        }
                    }
                }
            } catch (error) {
                console.error(error)
            }
        },

        _genSafeAPI(payload: string = "") {
            return `https://safe-transaction-${this.networkNameForSafeAPI}.safe.global/api/v1/safes/${this.getSafeAddress}/multisig-transactions/${payload}`
        },

        _filterTransactions(transactions: any[]) {
            const filteredTransactions = []
            for (let transaction of transactions) {
                if (
                    transaction.to.toLowerCase() === this.commonState.protocolAddress.toLowerCase() 
                    || transaction.to.toLowerCase() === this.commonState.interestRateModelAddress.toLowerCase()
                    || transaction.to.toLowerCase() === this.commonState.safeInfo.safeAddress.toLowerCase()
                    ) {
                    filteredTransactions.push(transaction)
                }
            }
            return filteredTransactions
        }
    },
})
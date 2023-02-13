import { defineStore } from 'pinia'
import { useCommonStore } from "./Common"
import { Contract } from 'ethers'
import axios from 'axios'
import { NetworkType } from '@/services/types'
import { toRaw } from 'vue'
import protocolDeclareFile from "@/contracts/Protocol.json"
import mappingDeclareFile from "@/contracts/MappingInterestRateModel.json"
import whitelistDeclareFile from "@/contracts/Whitelist.json"
import safeDeclareFile from "@/contracts/Safe.json"
const InputDataDecoder = require('ethereum-input-data-decoder')

export const useTransactionsStore = defineStore('transactions', {
    state: () => ({
        isInited: false,
        commonState: useCommonStore(),
        safeInstance: {} as Contract,
        networkNameForSafeAPI: "unknown",
        transactions: [] as any,
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
                [...protocolDeclareFile.abi, ...mappingDeclareFile.abi, ...whitelistDeclareFile.abi, ...safeDeclareFile.abi]
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

        async initTransactions() {
            const requestStr = this._genSafeAPI()
            try {
                const response = await axios.get(requestStr)
                this.transactions = this._filterTransactions(response.data.results)
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
            const requestStr = this._genSafeAPI()
            try {
                const response = await axios.get(requestStr)
                const newTransactions = this._filterTransactions(response.data.results)
                if (newTransactions.length !== this.transactions.length) {
                    this.transactions = newTransactions
                } else {
                    for (let i in newTransactions) {
                        if (JSON.stringify(newTransactions[i]) !== JSON.stringify(this.transactions[i])) {
                            this.transactions = newTransactions
                            break
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
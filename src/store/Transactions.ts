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
        transactions: [] as any,
        decoder: {} as any
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
                await this.initTransactions()
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

        async initTransactions() {
            const networkName = this._getStandardNetworkNameInSafeAPI(this.commonState.networkType)
            if (networkName === "unknown") {
                console.error("unknown network")
                return
            }
            const requestStr = `https://safe-transaction-${networkName}.safe.global/api/v1/safes/${this.getSafeAddress}/multisig-transactions/`
            try {
                const response = await axios.get(requestStr)
                this.transactions = this._filterTransactions(response.data.results)
            } catch (error) {
                console.error(error)
            }
        },

        _getStandardNetworkNameInSafeAPI(networkType: NetworkType) {
            switch (networkType) {
                case NetworkType.Main:
                    return "main"
                case NetworkType.Goerli:
                    return "goerli"
                default:
                    return "unknown"
            }
        },

        _filterTransactions(transactions: any[]) {
            const filteredTransactions = []
            for (let transaction of transactions) {
                if (transaction.to.toLowerCase() === this.commonState.protocolAddress.toLowerCase() || transaction.to.toLowerCase() === this.commonState.interestRateModelAddress.toLowerCase()) {
                    filteredTransactions.push(transaction)
                }
            }
            return filteredTransactions
        }
    },
})
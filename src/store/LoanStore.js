import {defineStore} from 'pinia'
import { useMetaMaskStore } from "./MetaMaskStore"

export const useLoanStore = defineStore('LoanStore', {
    state: () => ({
        whitelists: [],
        totalLoanOutstandingBalance: null,
    }),
    getters: {
        whitelists(state) {
            return state.whitelists
        },
        totalLoanOutstandingBalance(state) {
            return state.totalLoanOutstandingBalance
        }
    },
    actions: {
        async initWhitelists() {
            // return useMetaMaskStore
        },

        async initTotalLoanOutstandingBalance() {

        }
    }
})
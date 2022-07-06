import {defineStore} from 'pinia'
import { useMetaMaskStore } from "./Common"

export const useLoanStore = defineStore('LoanStore', {
    state: () => ({
        whitelists: [],
        totalLoanOutstandingBalance: null,
    }),
    getters: {
        getWhitelists(state) {
            return state.whitelists
        },
        getTotalLoanOutstandingBalance(state) {
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
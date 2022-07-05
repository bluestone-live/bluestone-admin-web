import {defineStore} from 'pinia'
import { useMetaMaskStore } from "./MetaMaskStore"

export const useDepositStore = defineStore('DepositStore', {
    state: () => ({
        whitelists: []
    }),
    getters: {
        whitelists(state) {
            return state.whitelists
        }
    },
    actions: {
        initWhitelists() {
            // return useMetaMaskStore
        }
    }
})
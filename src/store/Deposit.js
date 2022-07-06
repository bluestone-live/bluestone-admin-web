import {defineStore} from 'pinia'
import { useCommonStore } from "./Common"

export const useDepositStore = defineStore('DepositStore', {
    state: () => ({
        commonState: useCommonStore(),
        whitelists: []
    }),
    getters: {
        whitelists(state) {
            return state.whitelists
        }
    },
    actions: {
        async init() {
            await this.initWhitelists()
        },

        async initWhitelists() {
            // return useMetaMaskStore
        }
    }
})
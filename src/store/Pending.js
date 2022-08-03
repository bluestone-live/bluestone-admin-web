import { defineStore } from 'pinia'

export const usePendingStore = defineStore('pending', {
    state: () => ({
        pendingCount: 0,
    }),
    getters: {
        getPendingCount(state) {
            return state.pendingCount
        }
    },
    actions: {
        increment() {
            this.pendingCount++
        },
        decrement() {
            if(this.pendingCount > 0) {
                this.pendingCount--
            }
        }
    },
})
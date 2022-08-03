import { defineStore } from "pinia"

export const useNavbarStore = defineStore('navbar', {
    state: () => ({
        sidebarMinimized: false,
    }),
    getters: {
        isSidebarMinimized(state) {
            return state.sidebarMinimized
        }
    },
    actions: {
        updateSidebarCollapsedState(isSidebarMinimized) {
            this.sidebarMinimized = isSidebarMinimized
        },
    }
})
import { defineStore } from "pinia"

export const useNavbarStore = defineStore('navbar', {
    state: () => ({
        sidebarMinimized: false,
    }),
    actions: {
        updateSidebarCollapsedState(isSidebarMinimized: boolean) {
            this.sidebarMinimized = isSidebarMinimized
        },
    }
})
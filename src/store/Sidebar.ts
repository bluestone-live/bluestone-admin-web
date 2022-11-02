import { defineStore } from "pinia"

export const useSidebarStore = defineStore('navbar', {
    state: () => ({
        sidebarMinimized: false,
    }),
    actions: {
        updateSidebarCollapsedState(isSidebarMinimized: boolean) {
            this.sidebarMinimized = isSidebarMinimized
        },
    }
})
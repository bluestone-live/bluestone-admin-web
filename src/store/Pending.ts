import { defineStore } from 'pinia'

export const usePendingStore = defineStore('pending', {
    state: () => ({
        pendingCount: 0,
        queueLenth: 0,
        notifyQueue: [] as any,
    }),
    actions: {
        increment() {
            this.pendingCount++
        },
        decrement() {
            if(this.pendingCount > 0) {
                this.pendingCount--
            }
        },
        enqueue(notifyParams: any) {
            this.notifyQueue.push(notifyParams);
            this.queueLenth++;
        },
        dequeue() {
            this.queueLenth--;
            return this.notifyQueue.shift();
        }
    },
})
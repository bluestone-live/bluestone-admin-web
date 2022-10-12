import { defineStore } from 'pinia'
import { INotifyParams } from '@/services/types';

export const usePendingStore = defineStore('pending', {
    state: () => ({
        pendingCount: 0,
        queueLenth: 0,
        notifyQueue: [] as INotifyParams[],
    }),
    actions: {
        increment() {
            this.pendingCount++
        },
        decrement() {
            if (this.pendingCount > 0) {
                this.pendingCount--
            }
        },
        enqueue(notifyParams: INotifyParams) {
            this.notifyQueue.push(notifyParams);
            this.queueLenth++;
        },
    },
})
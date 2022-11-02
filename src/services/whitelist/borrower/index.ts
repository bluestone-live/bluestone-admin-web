import utils from "@/utils";
import { reactive } from "vue";

export const useBorrowerWhitelist = async (accountStore: any, pendingStore: any, whitelistStore: any, loanStore: any) => {
    const state = reactive({
        isOwner: accountStore.isOwner,
        columns: [
            { key: "id" },
            { key: "address" },
            { key: "status" },
            { key: "option" },
        ],
        whitelist: [] as any,
        filter: "",
        filteredCount: whitelistStore.whitelistedBorrowers.length,
        newBorrowerAddress: "",
        isAddLoading: false,
        isTableLoading: false,
        removeLoadingMap: new Map(),
    })

    whitelistStore.whitelistedBorrowers.forEach((borrowerAddress: string) => {
        let borrowerStatus =
            loanStore.getActiveBorrowers.indexOf(borrowerAddress) >= 0 ? "active" : "inactive";
        state.whitelist.push({
            address: borrowerAddress,
            status: borrowerStatus,
        });
        state.removeLoadingMap.set(borrowerAddress, false);
    });

    const reloadTable = async () => {
        try {
            state.isTableLoading = true;
            let tempWhitelist = [] as any;
            await whitelistStore.initWhitelistedBorrowers();
            whitelistStore.whitelistedBorrowers.forEach((borrowerAddress: any) => {
                const borrowerStatus =
                    loanStore.getActiveBorrowers.indexOf(borrowerAddress) >= 0
                        ? "active"
                        : "inactive";
                tempWhitelist.push(
                    { address: borrowerAddress, status: borrowerStatus })
                state.removeLoadingMap.set(borrowerAddress, false);
            });
            state.whitelist = tempWhitelist;
            state.isTableLoading = false;
        } catch (error) {
            state.isTableLoading = false;
            console.error(error);
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: "Refresh table failed. Please refresh page manually.",
                color: "warning"
            });
        }
    }

    const removeWhitelist = async (address: string) => {
        let tx;
        let result;
        try {
            tx =
                await whitelistStore.getWhitelistInstance.removeBorrowerWhitelisted(
                    address
                );
            console.log(tx);
        } catch (error) {
            console.error(error);
            return;
        }
        try {
            state.removeLoadingMap.set(address, true);
            pendingStore.increment();
            result = await tx.wait();
            console.log("remove result: ", result);
            pendingStore.decrement();
            state.removeLoadingMap.set(address, false);
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: "Remove account [" +
                    utils.shortenAddress(address) +
                    "] from whitelist success.",
                color: "success"
            });
            await reloadTable();
        } catch (error) {
            console.error(error);
            pendingStore.decrement();
            state.removeLoadingMap.set(address, false);
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: `Remove account [${utils.shortenAddress(address)}] from whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
        }
    }

    const addWhitelist = async (address: string) => {
        let tx;
        let result;
        try {
            tx = await whitelistStore.getWhitelistInstance.addBorrowerWhitelisted(
                address
            );
            state.isAddLoading = true;
            pendingStore.increment();
            state.isAddLoading = false;
            state.newBorrowerAddress = "";
            console.log(tx);
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: `Add account [${utils.shortenAddress(address)}] to whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            return;
        }
        try {
            result = await tx.wait();
            pendingStore.decrement();
            console.log("add result: ", result);
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: "Add account [" +
                    utils.shortenAddress(address) +
                    "] to whitelist success.",
                color: "success"
            });
            await reloadTable();
        } catch (error) {
            console.error(error);
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: `Add account [${utils.shortenAddress(address)}] to whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
        }
    }

    return {
        state,
        removeWhitelist,
        addWhitelist
    }
}
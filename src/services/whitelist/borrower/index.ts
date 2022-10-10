import utils from "@/utils";
import { reactive } from "vue";

export const useBorrowerWhitelist = async (commonStore: any, accountStore: any, pendingStore: any, whitelistStore: any, loanStore: any) => {
    const state = reactive({
        isAdministrator: false,
        columns: [
            { key: "id" },
            { key: "address" },
            { key: "status" },
            { key: "option" },
        ],
        borrowersOnWhitelists: whitelistStore.whitelistedBorrowers,
        activeBorrowers: loanStore.getActiveBorrowers,
        whitelist: [] as any,
        filter: "",
        filteredCount: whitelistStore.whitelistedBorrowers.length,
        newBorrowerAddress: "",
        isAddLoading: false,
        isTableLoading: false,
        removeLoadingMap: new Map(),
    })

    state.isAdministrator = await commonStore.getProtocol.isAdministrator(accountStore.getAccount);
    state.borrowersOnWhitelists.forEach((borrowerAddress: string) => {
        let borrowerStatus =
            state.activeBorrowers.indexOf(borrowerAddress) >= 0 ? "active" : "inactive";
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
                let borrowerStatus =
                    state.activeBorrowers.indexOf(borrowerAddress) >= 0
                        ? "active"
                        : "inactive";
                tempWhitelist.push(
                    { address: borrowerAddress, status: borrowerStatus, option: "Remove" })
            });
            state.whitelist = tempWhitelist;
            state.isTableLoading = false;
        } catch (error) {
            state.isTableLoading = false;
            console.log("table error")
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
            reloadTable();
            state.removeLoadingMap.set(address, false);
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: "Remove account [" +
                    utils.shortenAddress(address) +
                    "] from whitelist success.",
                color: "success"
            });
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
            return;
        }
        try {
            result = await tx.wait();
            pendingStore.decrement();
            console.log("add result: ", result);
            reloadTable();
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: "Add account [" +
                    utils.shortenAddress(address) +
                    "] to whitelist success.",
                color: "success"
            });
        } catch (error) {
            console.error(error);
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Whitelist: Borrower",
                message: `Add account [${utils.shortenAddress(address)}] to whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isAddLoading = false;
        }
    }

    return {
        state,
        removeWhitelist,
        addWhitelist
    }
}
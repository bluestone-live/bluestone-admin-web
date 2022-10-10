import utils from "@/utils";
import { reactive } from "vue";

export const useAdminWhitelist = async (pendingStore: any, accountStore: any, whitelistStore: any) => {
    const state = reactive({
        isOwner: false,
        currentAccount: accountStore.getAccount,
        ownerAccount: "",
        columns: [{ key: "id" }, { key: "address" }, { key: "option" }],
        filter: "",
        filteredCount: whitelistStore.administrators.length,
        administrators: whitelistStore.administrators,
        newAdministratorAddress: "",
        isAddLoading: false,
        isRemoveLoading: false,
        isTableLoading: false,
        removeLoadingMap: new Map(),
    })

    state.ownerAccount = await whitelistStore.getWhitelistInstance.owner();
    state.isOwner = state.currentAccount.toLowerCase() == state.ownerAccount.toLowerCase()
    state.administrators.forEach((borrowerAddress: string) => {
        state.removeLoadingMap.set(borrowerAddress, false);
    });

    const reloadTable = async () => {
        try {
            state.isTableLoading = true;
            await whitelistStore.initAdministrators();
            state.administrators = whitelistStore.administrators;
            state.isTableLoading = false;
        } catch (error) {
            state.isTableLoading = false;
            console.error(error);
            pendingStore.enqueue({
                title: "Whitelist: Administrator",
                message: "Refresh table failed. Please refresh page manually.",
                color: "warning"
            });
        }
    }

    const removeWhitelist = async (address: string) => {
        let tx;
        let result;
        try {
            tx = await whitelistStore.getWhitelistInstance.removeAdministrator(
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
                title: "Whitelist: Administrator",
                message: "Remove account [" +
                    utils.shortenAddress(address) +
                    "] from administrators whitelist success.",
                color: "success"
            });
        } catch (error) {
            console.error(error);
            pendingStore.decrement();
            state.removeLoadingMap.set(address, false);
            pendingStore.enqueue({
                title: "Whitelist: Administrator",
                message: `Remove account [${utils.shortenAddress(address)}] from administrators whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
        }
    }

    const addWhitelist = async (address: string) => {
        let tx;
        let result;
        try {
            tx = await whitelistStore.getWhitelistInstance.addAdministrator(
                address
            );
            state.isAddLoading = true;
            pendingStore.increment();
            state.isAddLoading = false;
            state.newAdministratorAddress = "";
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
                title: "Whitelist: Administrator",
                message: "Add account [" +
                    utils.shortenAddress(address) +
                    "] to administrators whitelist success.",
                color: "success"
            });
        } catch (error) {
            console.error(error);
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Whitelist: Administrator",
                message: `Add account [${utils.shortenAddress(address)}] to administrators whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isAddLoading = false;
        }
    }

    return {
        state,
        removeWhitelist,
        addWhitelist,
    }
}

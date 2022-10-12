import utils from "@/utils";
import { reactive } from "vue";

export const useLenderWhitelist = async (commonStore: any, pendingStore: any, whitelistStore: any, accountStore: any) => {
    const state = reactive({
        isAdministrator: false,
        columns: [
            { key: "id" },
            { key: "address" },
            { key: "option" },
        ],
        whitelist: [] as any,
        filter: "",
        filteredCount: whitelistStore.whitelistedLenders.length,
        newLenderAddress: "",
        isAddLoading: false,
        isTableLoading: false,
        removeLoadingMap: new Map(),
    })

    state.isAdministrator = await commonStore.getProtocol.isAdministrator(accountStore.getAccount);
    whitelistStore.whitelistedLenders.forEach((lenderAddress: string) => {
        state.removeLoadingMap.set(lenderAddress, false);
        state.whitelist.push({
            address: lenderAddress
        });
    });

    const reloadTable = async () => {
        try {
            state.isTableLoading = true;
            let tempWhitelist = [] as any;
            await whitelistStore.initWhitelistedLenders();
            whitelistStore.whitelistedLenders.forEach((lenderAddress: string) => {
                state.removeLoadingMap.set(lenderAddress, false);
                tempWhitelist.push({
                    address: lenderAddress
                });
            });
            state.whitelist = tempWhitelist;
            state.isTableLoading = false;
        } catch (error) {
            state.isTableLoading = false;
            console.error(error);
            pendingStore.enqueue({
                title: "Whitelist: Lender",
                message: "Refresh table failed. Please refresh page manually.",
                color: "warning"
            });
        }
    }

    const removeWhitelist = async (address: string) => {
        let tx;
        let result;
        try {
            tx = await whitelistStore.getWhitelistInstance.removeLenderWhitelisted(
                address
            );
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
                title: "Whitelist: Lender",
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
                title: "Whitelist: Lender",
                message: `Remove account [${utils.shortenAddress(address)}] from administrators whitelist failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
        }
    }

    const addWhitelist = async (address: string) => {
        let tx;
        let result;
        try {
            tx = await whitelistStore.getWhitelistInstance.addLenderWhitelisted(
                address
            );
            state.isAddLoading = true;
            pendingStore.increment();
            state.isAddLoading = false;
            state.newLenderAddress = "";
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
                title: "Whitelist: Lender",
                message: "Add account [" +
                    utils.shortenAddress(address) +
                    "] to whitelist success.",
                color: "success"
            });
        } catch (error) {
            console.error(error);
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Whitelist: Lender",
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
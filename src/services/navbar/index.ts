import utils from "@/utils";
import { reactive } from "vue";
import { NetworkType } from "@/services/types";

export const useNavbar = (commonStore: any, accountStore: any, pendingStore: any) => {
    const state = reactive({
        isNetworkErr: false,
        accountAddress: utils.shortenAddress(accountStore.getAccount),
        showPending: false,
        badgePendingCount: 0,
    })

    checkNetwork();

    const copyAddressToClipboard = () => {
        let oInput = document.createElement("input");
        oInput.value = pendingStore.getAccount;
        document.body.appendChild(oInput);
        oInput.select();
        document.execCommand("Copy");
        document.body.removeChild(oInput);
        pendingStore.enqueue({
            title: "Clipboard",
            message: `Copy address [${state.accountAddress}] to clipboard success.`,
            color: "info",
        });
    }

    function checkNetwork() {
        if (
            commonStore.networkType != NetworkType.Kovan &&
            commonStore.networkType != NetworkType.Goerli
        ) {
            state.isNetworkErr = true;
            pendingStore.enqueue({
                title: "MetaMask",
                message: "Please change Network to Kovan, Goerli testnet.",
                color: "danger",
            });
        }
    }

    return {
        state,
        copyAddressToClipboard
    }
}

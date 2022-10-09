import { TokenType, NetworkType, INetworkFile } from "@/services/types"
import { useCommonStore } from "@/store/Common";

const utils = {
    getTokenNameFromAddress(address: string) {
        const commonStore = useCommonStore();
        // let networkFile = await this.getNetworkFile(networkType);

        // console.log("networkFile=", commonStore.networkFile)
        // let networkFile = commonStore.networkFile;
        // switch (networkType) {
        //     case NetworkType.Main:
        //         break;
        //     case NetworkType.Kovan:
        switch (address.toLowerCase()) {
            case "0x0000000000000000000000000000000000000001":
                return TokenType.ETH
            case commonStore.networkFile.tokens.xBTC.address.toLowerCase():
                return TokenType.xBTC
            case commonStore.networkFile.tokens.SGC.address.toLowerCase():
                return TokenType.SGC;
        }
        //         break;
        //     case NetworkType.Goerli:

        // }
    },

    async getNetworkFile(networkType: NetworkType): Promise<INetworkFile> {
        let currentNetwork: string;
        switch (networkType) {
            case NetworkType.Main:
                currentNetwork = "main"
                break
            case NetworkType.Kovan:
                currentNetwork = "kovan"
                break
            case NetworkType.Rinkeby:
                currentNetwork = "rinkeby"
                break
            case NetworkType.Goerli:
                currentNetwork = "goerli"
                break
            default:
                currentNetwork = "private"
                break
        }
        return import(`../networks/${currentNetwork}.json`)
    },

    shortenAddress(address: string): string {
        return address.substring(0, 5) + "..." + address.substring(address.length - 4)
    },

    filterRevertMsg(msg: string): string {
        let indexStart = msg.indexOf(`(reason="`);
        if (indexStart === -1) {
            return msg;
        }

        indexStart += 9;
        let indexEnd = msg.indexOf(`", method=`);
        return msg.slice(indexStart, indexEnd);
    },

    formatTimestamp(timestamp: any) {
        var date = new Date(parseInt(timestamp) * 1000);
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return Y + M + D + " " + h + m + s;
    },

    formatObjectKey(keyStr: string) {
        let tempStr = keyStr.slice(0, 1).toUpperCase() + keyStr.slice(1)
        return tempStr.replace(/([A-Z])/g, ($1) => {
            return " " + $1
        });
    }
}

export default utils

import { TokenType, NetworkType, INetworkFile } from "@/services/types"

const utils = {
    getTokenNameFromAddress(address: string, networkType: NetworkType) {
        switch (networkType) {
            case NetworkType.Main:
                break;
            case NetworkType.Kovan:
                switch (address.toLowerCase()) {
                    case "0x0000000000000000000000000000000000000001":
                        return TokenType.ETH
                    case "0x81F9fA3c2F2989f5a76B6Ad8790CE8D66aF27f64".toLowerCase():
                        return TokenType.xBTC
                    case "0x3c432c6169df59BA09442bcF12D752710A8EEF9B".toLowerCase():
                        return TokenType.SGC;
                }
                break;
        }
    },

    async getNetworkFile(networkType: NetworkType): Promise<INetworkFile> {
        let currentNetwork: string;
        switch (networkType) {
            case NetworkType.Main:
                currentNetwork = "main"
                break
            case NetworkType.Kovan:
                currentNetwork = "kovan"
                break;
            case NetworkType.Rinkeby:
                currentNetwork = "rinkeby"
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

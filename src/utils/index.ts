// import { ethers } from "ethers";
import protocolDeclareFile from "@/contracts/Protocol.json"

interface ITokenDeclaration {
    name: string;
    symbol: string;
    address: string;
}

interface INetworkFile {
    contracts: { [key: string]: string };
    tokens: { [key: string]: ITokenDeclaration };
}

const utils = {
    async getNetworkFile(networkType: string): Promise<INetworkFile> {
        // Map web3 network type to that in network.json
        const currentNetwork =
            networkType === 'private' ? 'development' : networkType
        return import(`../networks/${currentNetwork}.json`)
    },

    shortenAddress(address: string): string {
        return address.substring(0, 5) + "..." + address.substring(38)
    }
}

export default utils

// export enum EventName {
//     LoanSucceed = 'LoanSucceed',
//     RepayLoanSucceed = 'RepayLoanSucceed',
//     AddCollateralSucceed = 'AddCollateralSucceed',
//     SubtractCollateralSucceed = 'SubtractCollateralSucceed',
//     DepositSucceed = 'DepositSucceed',
//     WithdrawSucceed = 'WithdrawSucceed',
//     EarlyWithdrawSucceed = 'EarlyWithdrawSucceed',
//     LiquidateLoanSucceed = 'LiquidateLoanSucceed',
//     Approval = 'Approval',
// }

// /**
//  * Provider implementation
//  */
// export class MetaMaskProvider {
//     private ethersInstance?: ethers.providers.Web3Provider
//     private networkType?: string
//     private protocolAddress?: string
//     private protocolInstance?: ethers.Contract

//     /**
//      * Init protocolInstance by global Web3 provider and network configs
//      */
//     async init() {
//         if ((window as any).ethereum) {
//             const ethereum = (window as any).ethereum;
//             this.ethersInstance = new ethers.providers.Web3Provider(ethereum)
//         } else {
//             throw new Error(
//                 'MetaMaskProvider init error: Require global web3 provider.'
//             )
//         }

//         const network = await this.ethersInstance.getNetwork()
//         const networkId = network.chainId

//         switch (networkId) {
//             case 1:
//                 this.networkType = 'main';
//                 break;
//             case 3:
//                 this.networkType = 'ropsten';
//                 break;
//             case 42:
//                 this.networkType = 'kovan';
//                 break;
//             case 4:
//                 this.networkType = 'rinkeby';
//                 break;
//             case 5:
//                 this.networkType = 'goerli';
//                 break;
//             default:
//                 this.networkType = 'private';
//         }
//         const networkFile = await this.getNetworkFile(this.networkType)

//         this.protocolAddress =
//             networkFile.contracts[protocolDeclareFile.contractName];

//         this.protocolInstance = new ethers.Contract(
//             this.protocolAddress,
//             protocolDeclareFile.abi as ethers.ContractInterface,
//             this.ethersInstance
//         );
//     }

//     get ethers() {
//         if (!this.ethersInstance) {
//             throw new Error("MetaMaskProvider: Init Failed.")
//         } else {
//             return this.ethersInstance
//         }
//     }

//     get network() {
//         if (!this.networkType) {
//             throw new Error("MetaMaskProvider: Init Failed.")
//         } else {
//             return this.networkType
//         }
//     }
//     get protocolContractAddress() {
//         if (!this.protocolAddress) {
//             throw new Error("MetaMaskProvider: Init Failed.")
//         } else {
//             return this.protocolAddress
//         }
//     }
//     get protocolContractInstance() {
//         if (!this.protocolInstance) {
//             throw new Error("MetaMaskProvider: Init Failed.")
//         } else {
//             return this.protocolInstance
//         }
//     }

//     private async getNetworkFile(networkType: string): Promise<INetworkFile> {
//         // Map web3 network type to that in network.json
//         const currentNetwork =
//             networkType === 'private' ? 'development' : networkType
//         return import(`@/networks/${currentNetwork}.json`)
//     }
// }
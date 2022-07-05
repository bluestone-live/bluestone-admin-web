import { defineStore } from 'pinia'
import { ethers } from "ethers"

export const useMetaMaskStore = defineStore('MetaMaskStore', {
    state: () => ({
        ethersInstance: null,
        networkType: null,
        protocolAddress: null,
        protocolInstance: null
    }),
    getters: {
        ethersInstance(state) {
            return state.ethersInstance
        }
    },
    actions: {
        initEthersInstance() {
            if (window.ethereum) {
                const ethereum = window.ethereum;
                this.ethersInstance = new ethers.providers.Web3Provider(ethereum)
            } else {
                throw new Error(
                    'MetaMaskProvider init error: Require global web3 provider.'
                )
            }
        },

        async initNetworkType() {
            const network = await this.ethersInstance.getNetwork()
            const networkId = network.chainId

            switch (networkId) {
                case 1:
                    this.networkType = 'main';
                    break;
                case 3:
                    this.networkType = 'ropsten';
                    break;
                case 42:
                    this.networkType = 'kovan';
                    break;
                case 4:
                    this.networkType = 'rinkeby';
                    break;
                case 5:
                    this.networkType = 'goerli';
                    break;
                default:
                    this.networkType = 'private';
            }

        },

        async getNetworkFile(networkType) {
            // Map web3 network type to that in network.json
            const currentNetwork =
                networkType === 'private' ? 'development' : networkType
            return import(`@/networks/${currentNetwork}.json`)
        },

        async initProtocolAddressAndInstance() {
            const networkFile = await this.getNetworkFile(this.networkType)
            this.protocolAddress = networkFile.contracts[protocolDeclareFile.contractName]
            this.protocolInstance = new ethers.Contract(
                this.protocolAddress,
                protocolDeclareFile.abi,
                this.ethersInstance
            )
        }
    },
})
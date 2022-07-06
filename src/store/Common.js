import { defineStore } from 'pinia'
import utils from "@/utils"
import { ethers } from "ethers"
import { toRaw } from "@vue/reactivity"

export const useCommonStore = defineStore('CommonStore', {
    state: () => ({
        ethersInstance: null,
        networkType: null,
        protocolAddress: null,
        protocolInstance: null
    }),
    getters: {
        getProvider(state) {
            return toRaw(state.ethersInstance)
        },
        getNetwork(state) {
            return state.networkType
        },
        getProtocolAddress(state) {
            return state.protocolAddress
        },
        getProtocol(state) {
            return state.protocolInstance
        }
    },
    actions: {
        async init() {
            this.initEthersInstance()
            console.log("CommonStore: init provider success.")
            await this.initNetworkType()
            console.log("CommonStore: init network success.")
            // await this.initProtocolAddressAndInstance()
            console.log("CommonStore: init protocol address and instance success.")
        },

        initEthersInstance() {
            if (window.ethereum) {
                this.ethersInstance = new ethers.providers.Web3Provider(window.ethereum)
            } else {
                throw new Error(
                    'Ethers Instance init error: Require global web3 provider.'
                )
            }
        },

        async initNetworkType() {
            const network = await this.getProvider.getNetwork()
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

        async initProtocolAddressAndInstance() {
            const networkFile = await utils.getNetworkFile(this.networkType)
            console.log("networkFile=", networkFile)
            this.protocolAddress = networkFile.contracts[protocolDeclareFile.contractName]
            this.protocolInstance = new ethers.Contract(
                this.protocolAddress,
                protocolDeclareFile.abi,
                this.ethersInstance
            )
        }
    },
})
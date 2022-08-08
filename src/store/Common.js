import { defineStore } from 'pinia'
import utils from "@/utils"
import { ethers, Contract } from "ethers"
import { toRaw } from "@vue/reactivity"
import protocolDeclareFile from "@/contracts/Protocol.json"
import erc20DeclareFile from "@/contracts/ERC20Mock.json"

export const useCommonStore = defineStore('common', {
    state: () => ({
        isInited: false,
        ethersInstance: null,
        networkId: 0,
        networkType: String,
        networkFile: null,
        protocolAddress: String,
        protocolInstance: Contract,
        erc20Instance: Contract,
        tokens: null,
    }),
    getters: {
        getInitStatus() {
            return this.isInited
        },
        getProvider(state) {
            return toRaw(state.ethersInstance)
        },
        getNetworkId(state) {
            return state.networkId
        },
        getNetworkType(state) {
            return state.networkType
        },
        getNetworkFile(state) {
            return state.networkFile
        },
        getProtocolAddress(state) {
            return state.protocolAddress
        },
        getProtocol(state) {
            return toRaw(state.protocolInstance)
        },
        getERC20(state) {
            return toRaw(state.erc20Instance)
        },
        getTokens(state) {
            return toRaw(state.tokens)
        }
    },
    actions: {
        async init() {
            try {
                this.initEthersInstance()
                await this.initNetworkType()
                await this.initProtocolRelated()
                this.initERC20Instance()
                this.isInited = true
                console.log("[Common]: Common Store init success.")
            } catch (error) {
                console.log("[Common]: Common Store init failed.")
                console.error(error)
            }
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
            this.networkId = network.chainId

            switch (this.networkId) {
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

        async initProtocolRelated() {
            this.networkFile = await utils.getNetworkFile(this.networkType)
            this.protocolAddress = this.networkFile.contracts[protocolDeclareFile.contractName]
            this.tokens = this.networkFile.tokens

            this.protocolInstance = new ethers.Contract(
                this.protocolAddress,
                protocolDeclareFile.abi,
                this.getProvider.getSigner()
            )
        },

        initERC20Instance() {
            const sgcAddress = this.getTokens.SGC.address
            this.erc20Instance = new ethers.Contract(
                sgcAddress,
                erc20DeclareFile.abi,
                this.getProvider.getSigner()
            )
        },
    },
})
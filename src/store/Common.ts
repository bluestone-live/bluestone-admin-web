import { defineStore } from 'pinia'
import utils from "@/utils"
import { ethers, Contract, providers } from "ethers"
import { toRaw } from "@vue/reactivity"
import protocolDeclareFile from "@/contracts/Protocol.json"
import mappingInterestRateModelDeclareFile from "@/contracts/MappingInterestRateModel.json"
import erc20DeclareFile from "@/contracts/ERC20Mock.json"
import { WalletSelector, NetworkType, INetworkFile } from "@/services/types"
import initSdk from '@gnosis.pm/safe-apps-sdk'
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider'

export const useCommonStore = defineStore('common', {
    state: () => ({
        isInited: false,
        wallet: WalletSelector.Disconnect,
        walletInited: false,
        // provider: {} as any,
        safeInfo: {} as any,
        ethersInstance: {} as providers.Web3Provider,
        networkType: NetworkType.None,
        networkFile: {} as INetworkFile,
        protocolAddress: "",
        protocolInstance: {} as Contract,
        interestRateModelAddress: "",
        interestRateModelInstance: {} as Contract,
        erc20Instance: {} as Contract,
        tokens: {} as INetworkFile["tokens"],
    }),
    getters: {
        // getWallectConnectProvider(state) {
        //     return toRaw(state.provider)
        // },
        getEthersProvider(state) {
            return toRaw(state.ethersInstance)
        },
        getProtocol(state) {
            return toRaw(state.protocolInstance)
        },
        getInterestRateModel(state) {
            return toRaw(state.interestRateModelInstance)
        },
        getERC20(state) {
            return toRaw(state.erc20Instance)
        },
        getTokens(state) {
            return toRaw(state.tokens)
        },
        getSafeInfo(state) {
            return toRaw(state.safeInfo)
        }
    },
    actions: {
        async init() {
            try {
                await this.initEthersInstance()
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

        async initEthersInstance() {
            const appsSdk = new initSdk()
            this.safeInfo = await appsSdk.safe.getInfo()
            this.ethersInstance = new ethers.providers.Web3Provider(new SafeAppProvider(this.safeInfo, appsSdk))
        },

        async initNetworkType() {
            const network = await ((this.getEthersProvider as any) as any).getNetwork()
            this.networkType = network.chainId
            console.log("network=", this.networkType)
        },

        async initProtocolRelated() {
            this.networkFile = await utils.getNetworkFile(this.networkType)
            this.protocolAddress = this.networkFile.contracts[protocolDeclareFile.contractName]
            this.protocolInstance = new ethers.Contract(
                this.protocolAddress,
                protocolDeclareFile.abi,
                (this.getEthersProvider as any).getSigner()
            )
            this.interestRateModelAddress = this.networkFile.contracts[mappingInterestRateModelDeclareFile.contractName]
            this.interestRateModelInstance = new ethers.Contract(
                this.interestRateModelAddress,
                mappingInterestRateModelDeclareFile.abi,
                (this.getEthersProvider as any).getSigner()
            )

            this.tokens = this.networkFile.tokens
        },

        initERC20Instance() {
            const sgcAddress = this.getTokens.SGC.address
            this.erc20Instance = new ethers.Contract(
                sgcAddress,
                erc20DeclareFile.abi,
                (this.getEthersProvider as any).getSigner()
            )
        },
    },
})
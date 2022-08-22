import { defineStore } from 'pinia'
import utils from "@/utils"
import { ethers, Contract, providers } from "ethers"
import { toRaw } from "@vue/reactivity"
import protocolDeclareFile from "@/contracts/Protocol.json"
import erc20DeclareFile from "@/contracts/ERC20Mock.json"
import { WalletSelector, NetworkType, INetworkFile } from "@/services/types";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const useCommonStore = defineStore('common', {
    state: () => ({
        isInited: false,
        wallet: window.localStorage.getItem("wallet") || WalletSelector.MetaMask,
        provider: {} as any,
        ethersInstance: {} as providers.Web3Provider,
        networkType: NetworkType.None,
        networkFile: {} as INetworkFile,
        protocolAddress: "",
        protocolInstance: {} as Contract,
        erc20Instance: {} as Contract,
        tokens: {} as INetworkFile["tokens"],
    }),
    getters: {
        getWallectConnectProvider(state) {
            return toRaw(state.provider) 
        },
        getEthersProvider(state) {
            return toRaw(state.ethersInstance)
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
                this.initWallet()
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

        initWallet() {
            let history = window.localStorage.getItem("wallet");
            if(history && history != "null") {
                console.log("history=", history)
                this.wallet = history
            } else {
                this.wallet = WalletSelector.MetaMask
            }
        },

        setWallet(selectedWallet: WalletSelector) {
            this.wallet = selectedWallet as any
            window.localStorage.setItem("wallet", selectedWallet as string);
            console.log("[Common]: Storage Wallet setted: ", this.wallet)
        },

        async initEthersInstance() {
            if (this.wallet == WalletSelector.MetaMask) {
                if ((window as any).ethereum) {
                    this.ethersInstance = new ethers.providers.Web3Provider((window as any).ethereum)
                } else {
                    throw new Error(
                        'Ethers Instance init error: Require global web3 provider.'
                    )
                }
            } else if (this.wallet == WalletSelector.WalletConnect) {
                this.provider = new WalletConnectProvider({
                    infuraId: "76eca7933f9a4b73a2438632bfd0180b",
                })
                await this.provider.enable()
                this.ethersInstance = new ethers.providers.Web3Provider(this.provider)
            }
        },

        async initNetworkType() {
            const network = await ((this.getEthersProvider as any) as any).getNetwork()
            this.networkType = network.chainId;
            console.log("networktype=", this.networkType)
        },

        async initProtocolRelated() {
            this.networkFile = await utils.getNetworkFile(this.networkType)
            this.protocolAddress = this.networkFile.contracts[protocolDeclareFile.contractName]
            this.tokens = this.networkFile.tokens

            this.protocolInstance = new ethers.Contract(
                this.protocolAddress,
                protocolDeclareFile.abi,
                (this.getEthersProvider as any).getSigner()
            )
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
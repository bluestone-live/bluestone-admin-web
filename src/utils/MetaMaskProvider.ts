import { ethers } from "ethers";

export enum EventName {
    LoanSucceed = 'LoanSucceed',
    RepayLoanSucceed = 'RepayLoanSucceed',
    AddCollateralSucceed = 'AddCollateralSucceed',
    SubtractCollateralSucceed = 'SubtractCollateralSucceed',
    DepositSucceed = 'DepositSucceed',
    WithdrawSucceed = 'WithdrawSucceed',
    EarlyWithdrawSucceed = 'EarlyWithdrawSucceed',
    LiquidateLoanSucceed = 'LiquidateLoanSucceed',
    Approval = 'Approval',
}

/**
 * Provider implementation
 */
export class MetaMaskProvider {
    private provider: any
    private networkType: string
    private protocolAddress: string
    private protocolInstance: string

    /**
     * Init protocolInstance by global Web3 provider and network configs
     */
    async init() {
        if ((window as any).ethereum) {
            const ethereum = (window as any).ethereum;
            this.provider = new ethers.providers.Web3Provider(ethereum)
        } else {
            throw new Error(
                'MetaMaskProvider init error: Require global web3 provider.'
            )
        }

        const networkId = this.provider.getNetwork().chainId

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
        const networkFile = await this.getNetworkFile(this.networkType)

        this.protocolAddress =
            networkFile.contracts[protocolDeclareFile.contractName];

        this.protocolInstance = new this.web3Instance.eth.Contract(
            protocolDeclareFile.abi as AbiItem[],
            this.protocolAddress,
        );
    }

    private async getNetworkFile(networkType: string) {
        // Map web3 network type to that in network.json
        const currentNetwork =
            networkType === 'private' ? 'development' : networkType
        return import(`@/networks/${currentNetwork}.json`)
    }
}
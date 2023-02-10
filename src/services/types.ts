import { BigNumber } from "ethers";

enum WalletSelector {
    Disconnect = "Disconnect",

    MetaMask = "MetaMask",
    WalletConnect = "WalletConnect",
}

enum NetworkType {
    None,

    Main = 1,
    Goerli = 5,
    Sepolia = 11155111
}

enum TokenType {
    ETH = "ETH",
    xBTC = "xBTC",
    SGC = "SGC"
}

interface INotifyParams {
    title: string;
    message: string;
    color: string;
}

interface ITokenDeclaration {
    name: string;
    symbol: string;
    address: string;
}

interface INetworkFile {
    contracts: { [key: string]: string };
    tokens: { [key: string]: ITokenDeclaration };
}

interface IPool {
    poolId: BigNumber;
    availableAmount: BigNumber;
    depositAmount: BigNumber;
    loanInterest: BigNumber;
    totalDepositWeight: BigNumber;
}

interface ILoanRecord {
    isClosed: boolean;
    loanId: string;
    loanTokenAddress: string;
    collateralTokenAddress: string;
    collateralCoverageRatio: BigNumber;
    loanAmount: BigNumber;
    collateralAmount: BigNumber;
    loanTerm: BigNumber;
    annualInterestRate: BigNumber;
    interest: BigNumber;
    minCollateralCoverageRatio: BigNumber;
    alreadyPaidAmount: BigNumber;
    remainingDebt: BigNumber;
    liquidatedAmount: BigNumber;
    soldCollateralAmount: BigNumber;
    createdAt: BigNumber;
    dueAt: BigNumber;
}

interface IHandledLoanRecord {
    isClosed: boolean;
    isMarginCall: boolean;
    isLiquidable: boolean;
    loanId: string;
    loanTokenAddress: string;
    collateralTokenAddress: string;
    collateralCoverageRatio: string;
    loanAmount: string;
    collateralAmount: string;
    loanTerm: string;
    annualInterestRate: string;
    interest: string;
    minCollateralCoverageRatio: string;
    alreadyPaidAmount: string;
    remainingDebt: string;
    liquidatedAmount: string;
    soldCollateralAmount: string;
    createdAt: string;
    dueAt: string;
}

interface IConfirmation {
    owner: string,
    signature: string,
    signatureType: string,
    submissionDate: string,
    transactionHash: string | null
}

interface ITransactionRecord {
    confirmations: Array<IConfirmation>;
    confirmationsRequired: number,
    data: string,
    decodedData: IDecodedTransactionData,
    executionDate: string,
    executor: string,
    isExecuted: boolean,
    isSuccessful: boolean | null,
    nonce: number,
    safeTxHash: string,
    submissionDate: string,
    to: string,
    transactionHash: string | null
}

interface IDecodedTransactionData {
    method: string,
    inputs: string[],
    names: string[],
    types: string[]
}

export { WalletSelector, NetworkType, TokenType };
export type { INetworkFile, IPool, ILoanRecord, IHandledLoanRecord, INotifyParams, ITransactionRecord, IDecodedTransactionData };

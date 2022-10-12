import { BigNumber } from "ethers";

enum WalletSelector {
    Disconnect = "Disconnect",

    MetaMask = "MetaMask",
    WalletConnect = "WalletConnect",
}

enum NetworkType {
    None,

    Main = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Kovan = 42
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

export { WalletSelector, NetworkType, TokenType };
export type { INetworkFile, IPool, ILoanRecord, IHandledLoanRecord, INotifyParams };

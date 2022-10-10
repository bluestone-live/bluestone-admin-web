import utils from "@/utils";
import { BigNumber } from "ethers";
import { reactive } from "vue";

export const useDashboard = (loanStore: any, depositStore: any, oracleStore: any) => {
    const state = reactive({
        columns: [
            { key: "poolId" },
            { key: "availableAmount" },
            { key: "depositAmount" },
            { key: "loanInterest" },
            { key: "totalDepositWeight" },
            { key: "dueDate" },
        ],
        priceInfoTiles: [
            {
                price: oracleStore.getBtcPrice,
                title: "xBTC/USD",
            },
            {
                price: oracleStore.getEthPrice,
                title: "ETH/USD",
            },
        ],
        balanceInfoTiles: [
            {
                color: "danger",
                balance: depositStore.getSgcBalance,
                price: oracleStore.getSgcPrice * (depositStore.getSgcBalance as number),
                title: "SGC Balance",
                text: "sgc",
                icon: "",
            },
            {
                color: "secondary",
                balance: depositStore.getTotalLoanOutstandingBalance,
                price: oracleStore.getSgcPrice * (depositStore.getTotalLoanOutstandingBalance as number),
                title: "Total Loan Outstanding Balance",
                text: "sgc",
                icon: "",
            },
        ],
        statusInfoTiles: [
            {
                color: "#3d9209",
                value: loanStore.activeLoansCount,
                text: "activeLoans",
            },
            {
                color: "#2c82e0",
                value: loanStore.totalLoansCount,
                text: "totalLoans",
            },
            {
                color: "#ffd43a",
                value: loanStore.marginCallLoansCount,
                text: "marginCall",
            },
            {
                color: "#e42222",
                value: loanStore.liquidableLoansCount,
                text: "liquidable",
            },
        ],
        availableSgcPools: [],
    })

    state.availableSgcPools = filterAvailableSgcPools(depositStore.sgcPools);

    function filterAvailableSgcPools(sgcPools: any) {
        let tempArr: any = [];
        sgcPools.forEach((pool: any) => {
            if (pool.availableAmount.gt(BigNumber.from(0))) {
                tempArr.push({
                    poolId: pool.poolId.toNumber(),
                    availableAmount:
                        pool.availableAmount.mul(10000).div(depositStore.exp).toNumber() /
                        10000 +
                        " SGC",
                    depositAmount:
                        pool.depositAmount.mul(10000).div(depositStore.exp).toNumber() /
                        10000 +
                        " SGC",
                    loanInterest:
                        pool.loanInterest.mul(10000).div(depositStore.exp).toNumber() /
                        10000 +
                        " SGC",
                    totalDepositWeight:
                        pool.totalDepositWeight.div(depositStore.exp).toNumber() +
                        " SGC·Days",
                    dueDate: utils.formatTimestamp(pool.poolId.mul(86400).toNumber()),
                });
            }
        });
        return tempArr;
    }

    return {
        state
    }
}
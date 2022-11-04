import { reactive } from "vue";
import { marginCollateralCoverageRatio } from "@/margin/index";
import { ILoanRecord, IHandledLoanRecord, TokenType } from "@/services/types";
import { BigNumber, ethers } from "ethers";
import utils from "@/utils";

export const useLoanList = (commonStore: any, accountStore: any, pendingStore: any, loanStore: any, whitelistStore: any, oracleStore: any) => {
    const state = reactive({
        exp: BigNumber.from("10").pow(18),
        toggleOptions: [
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Margin", value: "marginCall" },
            { label: "Liquidable", value: "liquidable" },
        ],
        loanRecordsKeyIcon: [
            "label",
            "label",
            "label",
            "paid",
            "paid",
            "date_range",
            "donut_small",
            "paid",
            "donut_small",
            "donut_small",
            "paid",
            "paid",
            "paid",
            "date_range",
            "date_range",
            "paid",
            "priority_high",
            "priority_high",
            "priority_high",
        ],

        isKeeper: whitelistStore.isKeeper,
        whitelistedBorrowers: whitelistStore.whitelistedBorrowers,

        borrowerValueForFilter: "",   // filter loaner records by input
        toggleValueForFilter: "all",    // filter loaner records
        lastFilter: "",               // 'toggle' or 'input'
        loanRecordsMap: new Map(),      // loanId => rawLoanRecord
        handledLoanRecords: new Map(),  // borrower => handledLoanRecord
        filteredLoanRecords: new Map(), // borrower => handledLoanRecord

        showMarginCallModal: false,
        showLiquidateModal: false,
        selectedLoanRecord: {} as ILoanRecord,
        inputLiquidateAmount: "",
        minLiquidateAmount: "0",
        safeLiquidateAmount: "",
        maxLiquidateAmount: "",
        liquidatedCCR: 0,
        safeCCR: 220,   // 220%
        liquidateLoadingMap: new Map(),
        isLiquidateLoading: false,
    });

    state.handledLoanRecords = handleRawLoanRecords(
        loanStore.getBorrowers,
        loanStore.getBorrowersLoanRecords
    );
    state.filteredLoanRecords = state.handledLoanRecords;

    // 1. front-end logic
    const clickMarginCall = async () => {
        state.showMarginCallModal = true;
    }

    const clickLiquidate = (loanId: string) => {
        state.inputLiquidateAmount = "";
        state.selectedLoanRecord = state.loanRecordsMap.get(loanId);
        state.safeLiquidateAmount = calcSafeLiquidateValue(state.selectedLoanRecord);
        state.maxLiquidateAmount = ethers.utils.formatEther(
            state.selectedLoanRecord.remainingDebt
        );
        state.liquidatedCCR = calcCollateralCoverageRatio(state.selectedLoanRecord, BigNumber.from("0"));
        state.showLiquidateModal = true;
    }

    const getCollapseColor = (loanDetail: any) => {
        if (loanDetail.isClosed) {
            return "gray";
        } else {
            if (loanDetail.isLiquidable) {
                return "danger";
            } else if (loanDetail.isMarginCall) {
                return "warning";
            } else {
                return "background";
            }
        }
    }

    // 2. data handler
    const filterByInput = () => {
        let tempMap = new Map();
        state.handledLoanRecords.forEach(
            (loanRecords: IHandledLoanRecord[], address: string) => {
                if (
                    address.toLowerCase().search(state.borrowerValueForFilter.toLowerCase()) !== -1
                ) {
                    tempMap.set(address, loanRecords);
                }
            }
        );
        state.filteredLoanRecords = tempMap;
        state.lastFilter = "input";
    }

    const filterByToggle = () => {
        let tempMap = new Map();
        switch (state.toggleValueForFilter) {
            case "all":
                tempMap = state.handledLoanRecords;
                break;
            case "active": {
                state.handledLoanRecords.forEach(
                    (loanRecords: IHandledLoanRecord[], address: string) => {
                        let tempRecords = [] as IHandledLoanRecord[];
                        loanRecords.forEach((loanRecord: IHandledLoanRecord) => {
                            if (!loanRecord.isClosed) {
                                tempRecords.push(loanRecord);
                            }
                        });
                        if (tempRecords.length > 0) {
                            tempMap.set(address, tempRecords);
                        }
                    }
                );
                break;
            }
            case "marginCall": {
                state.handledLoanRecords.forEach(
                    (loanRecords: IHandledLoanRecord[], address: string) => {
                        let tempRecords: IHandledLoanRecord[] = [];
                        loanRecords.forEach((loanRecord: IHandledLoanRecord) => {
                            if (loanRecord.isMarginCall) {
                                tempRecords.push(loanRecord);
                            }
                        });
                        if (tempRecords.length > 0) {
                            tempMap.set(address, tempRecords);
                        }
                    }
                );
                break;
            }
            case "liquidable": {
                state.handledLoanRecords.forEach(
                    (loanRecords: IHandledLoanRecord[], address: string) => {
                        let tempRecords: IHandledLoanRecord[] = [];
                        loanRecords.forEach((loanRecord: IHandledLoanRecord) => {
                            if (loanRecord.isLiquidable) {
                                tempRecords.push(loanRecord);
                            }
                        });
                        if (tempRecords.length > 0) {
                            tempMap.set(address, tempRecords);
                        }
                    }
                );
                break;
            }
        }
        state.filteredLoanRecords = tempMap;
        state.lastFilter = "toggle";
    }

    function handleRawLoanRecords(
        borrowers: Array<string>,
        rawLoanRecords: Map<string, ILoanRecord[]>
    ): Map<string, IHandledLoanRecord[]> {
        let tempMap = new Map();
        let date = new Date();
        borrowers.forEach((borrower) => {
            let loanRecords = rawLoanRecords.get(borrower);
            let tempRecords = [] as IHandledLoanRecord[];
            loanRecords?.forEach((loanRecord: ILoanRecord) => {
                let tempRecord: IHandledLoanRecord = {
                    loanId: loanRecord.loanId,
                    loanTokenAddress: loanRecord.loanTokenAddress,
                    collateralTokenAddress: loanRecord.collateralTokenAddress,
                    loanAmount:
                        ethers.utils.formatEther(loanRecord.loanAmount) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.loanTokenAddress),
                    collateralAmount:
                        ethers.utils.formatEther(loanRecord.collateralAmount) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.collateralTokenAddress),
                    loanTerm: loanRecord.loanTerm.toNumber() + " Days",
                    annualInterestRate:
                        loanRecord.annualInterestRate
                            .mul(10000)
                            .div(state.exp)
                            .toNumber() /
                        100 +
                        "%",
                    interest:
                        ethers.utils.formatEther(loanRecord.interest) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.loanTokenAddress),
                    collateralCoverageRatio:
                        loanRecord.collateralCoverageRatio
                            .mul(10000)
                            .div(state.exp)
                            .toNumber() /
                        100 +
                        "%",
                    minCollateralCoverageRatio:
                        loanRecord.minCollateralCoverageRatio
                            .mul(10000)
                            .div(state.exp)
                            .toNumber() /
                        100 +
                        "%",
                    alreadyPaidAmount:
                        ethers.utils.formatEther(loanRecord.alreadyPaidAmount) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.loanTokenAddress),
                    liquidatedAmount:
                        ethers.utils.formatEther(loanRecord.liquidatedAmount) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.loanTokenAddress),
                    soldCollateralAmount:
                        ethers.utils.formatEther(loanRecord.soldCollateralAmount) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.collateralTokenAddress),
                    createdAt: utils.formatTimestamp(loanRecord.createdAt.toNumber()),
                    dueAt: utils.formatTimestamp(loanRecord.dueAt.toNumber()),
                    remainingDebt:
                        ethers.utils.formatEther(loanRecord.remainingDebt) +
                        " " +
                        utils.getTokenNameFromAddress(loanRecord.loanTokenAddress),
                    isClosed: loanRecord.isClosed,
                    isMarginCall:
                        !loanRecord.isClosed &&
                        loanRecord.collateralCoverageRatio.lte(
                            marginCollateralCoverageRatio
                        ),
                    isLiquidable:
                        !loanRecord.isClosed &&
                        (loanRecord.collateralCoverageRatio.lt(
                            loanRecord.minCollateralCoverageRatio
                        ) ||
                            loanRecord.dueAt.mul(1000).lt(BigNumber.from(date.getTime()))),
                };
                tempRecords.push(tempRecord);

                state.loanRecordsMap.set(
                    loanRecord.loanId,
                    loanRecord
                );
            });
            tempMap.set(borrower, tempRecords);
        });
        return tempMap;
    }

    const calcSafeLiquidateValue = (loanRecord: ILoanRecord) => {
        const precision = 0.000000001;
        const currentCCR = loanRecord.collateralCoverageRatio
            .mul(10000)
            .div(state.exp)
            .toNumber() / 100;
        if (currentCCR >= state.safeCCR || (state.safeCCR - currentCCR) / state.safeCCR <= precision) {
            return "0";
        }

        let high = BigNumber.from(loanRecord.remainingDebt);
        let low = BigNumber.from("0");
        let targetBigNumberValue: BigNumber;
        while (true) {
            targetBigNumberValue = high.add(low).div(2);
            const ccr = calcCollateralCoverageRatio(loanRecord, targetBigNumberValue);
            if (Math.abs(ccr - state.safeCCR) / state.safeCCR <= precision) {
                break;
            } else {
                if (ccr > state.safeCCR) {
                    high = targetBigNumberValue;
                } else {
                    low = targetBigNumberValue;
                }
            }
        }
        return ethers.utils.formatEther(targetBigNumberValue);
    }

    const calcCollateralCoverageRatio = (loanRecord: ILoanRecord, liquidateAmount: BigNumber) => {
        let collateralTokenPrice;
        const collateralToken = utils.getTokenNameFromAddress(loanRecord.collateralTokenAddress);
        if (collateralToken === TokenType.ETH) {
            collateralTokenPrice = oracleStore.ethPrice;
        }
        if (collateralToken === TokenType.xBTC) {
            collateralTokenPrice = oracleStore.btcPrice;
        }
        const remainingDebt = loanRecord.loanAmount
            .add(loanRecord.interest)
            .sub(loanRecord.alreadyPaidAmount)
            .sub(loanRecord.liquidatedAmount)
            .sub(liquidateAmount);
        const remainingCollateralAmount = loanRecord.collateralAmount
            .sub(loanRecord.soldCollateralAmount)
            .sub(liquidateAmount
                .mul(BigNumber.from("95"))
                .div(BigNumber.from("100"))     // liquidationDiscount = 0.05;
                .mul(oracleStore.sgcPrice)
                .div(collateralTokenPrice));
        const targetValue = remainingCollateralAmount
            .mul(collateralTokenPrice)
            .mul(BigNumber.from("10000"))
            .div(remainingDebt)
            .div(oracleStore.sgcPrice)
            .toNumber() / 100;
        return targetValue;
    }

    // 3. on-chain logic
    const reloadMap = async () => {
        try {
            await loanStore.initBorrowersLoanRecords();
            state.handledLoanRecords = handleRawLoanRecords(
                loanStore.getBorrowers,
                loanStore.getBorrowersLoanRecords
            );
            if (state.lastFilter === "input") {
                filterByInput();
            } else if (state.lastFilter === "toggle") {
                filterByToggle();
            } else {
                state.filteredLoanRecords = state.handledLoanRecords;
            }
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: "Refresh loan list failed. Please refresh page manually.",
                color: "warning",
            })
        }
    }

    const liquidateLoan = async (loanId: string, inputAmount: string) => {
        const liquidateAmount = ethers.utils.parseUnits(inputAmount, "ether");
        try {
            // 1.Whether need Approve
            const isSufficent = await isAllowanceSufficient(
                accountStore.getAccount,
                commonStore.protocolAddress,
                liquidateAmount
            );
            if (!isSufficent) {
                await approveProtocol(loanId, commonStore.protocolAddress);
            }

            // 2.Liquidate
            await liquidate(loanId, liquidateAmount);
        } catch (error) {
            console.error(error);
            return;
        }

        // 3.refresh page
        await reloadMap();
    }

    const isAllowanceSufficient = async (
        owner: string,
        spender: string,
        liquidateAmount: BigNumber
    ) => {
        try {
            const allowance: BigNumber = await commonStore.getERC20.allowance(
                owner,
                spender
            );
            return allowance.gt(liquidateAmount) ? true : false;
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: "Get allowance failed. Please retry.",
                color: "danger",
            });
            throw error;
        }
    }

    const approveProtocol = async (loanId: string, protocol: string) => {
        const approveAmount = BigNumber.from(2).pow(256).sub(1);
        let approveTx;
        try {
            approveTx = await commonStore.getERC20.approve(protocol, approveAmount);
        } catch (error) {
            console.log(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `MetaMask execute [approve] failed. (${utils.filterRevertMsg(
                    (error as any).message
                )})`,
                color: "danger",
            });
            throw error;
        }
        try {
            state.isLiquidateLoading = true;
            state.liquidateLoadingMap.set(loanId, true);
            pendingStore.increment();
            const result = await approveTx.wait();
            state.isLiquidateLoading = false;
            state.liquidateLoadingMap.set(loanId, false);
            pendingStore.decrement();
            console.log("Approve result:", result);
        } catch (error) {
            console.error(error);
            state.isLiquidateLoading = false;
            state.liquidateLoadingMap.set(loanId, false);
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Configuration",
                message: `Approved account [${utils.shortenAddress(accountStore.getAccount)}] failed. (${utils.filterRevertMsg(
                    (error as any).message
                )})`,
                color: "danger",
            });
            throw error;
        }
    }

    const liquidate = async (loanId: string, liquidateAmount: BigNumber) => {
        let tx;
        let result;
        try {
            tx = await commonStore.getProtocol.liquidateLoan(
                loanId,
                liquidateAmount
            );
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `MetaMask execute [liquidateLoan] failed. (${utils.filterRevertMsg(
                    (error as any).message
                )})`,
                color: "danger",
            });
            throw error;
        }
        try {
            state.isLiquidateLoading = true;
            state.liquidateLoadingMap.set(loanId, true);
            pendingStore.increment();
            result = await tx.wait();
            state.isLiquidateLoading = false;
            state.liquidateLoadingMap.set(loanId, false);
            state.showLiquidateModal = false;
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Configuration",
                message: "Liquidate loan [" + utils.shortenAddress(loanId) + "] success.",
                color: "success",
            });
            console.log("liquidateLoan result:", result);
        } catch (error) {
            console.error(error);
            state.isLiquidateLoading = false;
            state.liquidateLoadingMap.set(loanId, false);
            pendingStore.decrement();
            pendingStore.enqueue({
                title: "Configuration",
                message: `Liquidate loan [${utils.shortenAddress(
                    loanId
                )}] failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            throw error;
        }
    }

    const copyToClipboard = (copyValue: string) => {
        let oInput = document.createElement("input");
        oInput.value = copyValue;
        document.body.appendChild(oInput);
        oInput.select();
        document.execCommand("Copy");
        document.body.removeChild(oInput);
    }

    return {
        state,
        clickMarginCall,
        clickLiquidate,
        getCollapseColor,
        filterByInput,
        filterByToggle,
        calcCollateralCoverageRatio,
        liquidateLoan,
        copyToClipboard
    }
}
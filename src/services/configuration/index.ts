import { reactive } from "vue";
import * as echarts from "echarts";
import { BigNumber, ethers } from "ethers";
import utils from "@/utils";
import { TokenType } from "../types";

export const useConfiguration = async (commonStore: any, accountStore: any, pendingStore: any) => {
    const state = reactive({
        isOwner: accountStore.isOwner,
        openSetGatewayAddress: false,
        openSetInterestRateModel: false,
        openSetMinCollateralCoverageRatio: false,
        currentGatewayAddress: "0x9489f551e2dd40aA69518D2502Fe394212A0020D",
        currentMinCollateralCoverageRatio: {
            ETH: 0,
            xBTC: 0,
        },
        currentInterestRateParams: {
            termList: [],
            interestRateList: [],
        },
        chartNeedRefresh: false,
        inputTermList: "",
        inputInterestRateList: "",
        inputGatewayAddress: "",
        inputMinCollateralCoverageRatioOfETH: "",
        inputMinCollateralCoverageRatioOfXBTC: "",
        isSetInterestRateModelLoading: false,
        isSetGatewayAddressLoading: false,
        isSetETHMinCollateralCoverageRatioLoading: false,
        isSetXBTCMinCollateralCoverageRatioLoading: false,
    })

    await Promise.all([
        initInterestRates(),
        initCurrentMinCollateralRatio(),
    ])

    const initChart = () => {
        const chartDom = document.getElementById("interest-model-chart");
        chartDom?.removeAttribute('_echarts_instance_');
        const myChart = echarts.init(chartDom!);
        myChart.setOption({
            title: {
                text: "Mapping Interest Rate Model",
            },
            tooltip: {
                trigger: "axis",
            },
            legend: {
                data: ["SGC", "Step Middle", "Step End"],
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            toolbox: {
                feature: {
                    saveAsImage: {},
                },
            },
            xAxis: {
                type: "category",
                data: state.currentInterestRateParams.termList,
                axisLabel: {
                    label: "Loan Term",
                    color: 'black',
                }
            },
            yAxis: {
                type: "value",
            },
            series: [
                {
                    name: "SGC",
                    type: "scatter",
                    step: "start",
                    data: state.currentInterestRateParams.interestRateList,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'top',
                                textStyle: {
                                    color: 'black',
                                    fontSize: 10
                                },
                            }
                        }
                    },
                },
            ],
        });
    }

    const setInterestRates = async () => {
        const terms = state.inputTermList.toString().replace(/\s*/g, "").split(",").map((term) => BigNumber.from(term));
        const interestRates = state.inputInterestRateList.toString().replace(/\s*/g, "").split(",").map((interestRate) => ethers.utils.parseUnits(interestRate, "ether"));
        let tx, result;
        try {
            tx = await commonStore.getInterestRateModel.setRates(
                commonStore.getTokens.SGC.address,
                terms,
                interestRates,
            );
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set interest rates of InterestRateModel failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            return;
        }
        try {
            state.isSetInterestRateModelLoading = true;
            pendingStore.increment();
            result = await tx.wait();
            console.log("setInterestRateParameters result: ", result);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set interest rates [${state.inputTermList}] => [${state.inputInterestRateList}] success.`,
                color: "success"
            });
            state.isSetInterestRateModelLoading = false;
            pendingStore.decrement();
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set interest rates of InterestRateModel failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isSetInterestRateModelLoading = false;
            pendingStore.decrement();
            return
        }
        try {
            await initInterestRates();
            state.chartNeedRefresh = true;
        } catch (error) {
            console.error(error);
        }
    }

    const setGatewayAddress = async () => {
        state.currentGatewayAddress = state.inputGatewayAddress;
    }

    const setMinCollateralCoverageRatioForETH = async () => {
        let tx, result;
        try {
            tx = await commonStore.getProtocol.setLoanAndCollateralTokenPair(
                    commonStore.getTokens.SGC.address,
                    commonStore.getTokens.ETH.address,
                    ethers.utils.parseUnits(String(parseFloat(state.inputMinCollateralCoverageRatioOfETH) / 100), "ether"),
                    ethers.utils.parseUnits("0.05", "ether")
                );
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set Min CollateralCoverageRatio for token pair ETH-SGC failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            return;
        }
        try {
            state.isSetETHMinCollateralCoverageRatioLoading = true;
            pendingStore.increment();
            result = await tx.wait();
            console.log("setMinCollateralCoverageRatioForETH result: ", result);
            pendingStore.enqueue({
                title: "Configuration",
                message: "Set MinCollateralCoverageRatio for token pair ETH-SGC success.",
                color: "success"
            });
            state.isSetETHMinCollateralCoverageRatioLoading = false;
            pendingStore.decrement();
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set Min CollateralCoverageRatio for token pair ETH-SGC failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isSetETHMinCollateralCoverageRatioLoading = false;
            pendingStore.decrement();
            return;
        }
        try {
            await initCurrentMinCollateralRatio();
        } catch (error) {
            console.error(error);
        }
    }

    const setMinCollateralCoverageRatioForXBTC = async () => {
        let tx, result;
        try {
            tx = await commonStore.getProtocol.setLoanAndCollateralTokenPair(
                commonStore.getTokens.SGC.address,
                commonStore.getTokens.xBTC.address,
                ethers.utils.parseUnits(String(parseFloat(state.inputMinCollateralCoverageRatioOfXBTC) / 100), "ether"),
                ethers.utils.parseUnits("0.05", "ether")
            );
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set Min CollateralCoverageRatio for token pair XBTC-SGC failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            return;
        }
        try {
            state.isSetXBTCMinCollateralCoverageRatioLoading = true;
            pendingStore.increment();
            result = await tx.wait();
            console.log("setMinCollateralCoverageRatioForXBTC result: ", result);
            pendingStore.enqueue({
                title: "Configuration",
                message: "Set MinCollateralCoverageRatio for token pair XBTC-SGC success.",
                color: "success"
            });
            state.isSetXBTCMinCollateralCoverageRatioLoading = false;
            pendingStore.decrement();
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set Min CollateralCoverageRatio for token pair XBTC-SGC failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isSetXBTCMinCollateralCoverageRatioLoading = false;
            pendingStore.decrement();
            return;
        }
        try {
            await initCurrentMinCollateralRatio();
        } catch (error) {
            console.error(error);
        }
    }

    async function initInterestRates() {
        const interestDetail = await commonStore.getInterestRateModel.getAllRates(commonStore.tokens.SGC.address);
        const termList = interestDetail.termList.map((term: BigNumber) => term.toNumber());
        const interestRateList = interestDetail.interestRateList.map((interestRate: BigNumber) => ethers.utils.formatEther(interestRate));
        state.currentInterestRateParams = { termList, interestRateList };
    }

    async function initCurrentMinCollateralRatio() {
        const filter = await commonStore.getProtocol.filters.SetLoanAndCollateralTokenPairSucceed();
        const loanEvents = await commonStore.getProtocol.queryFilter(filter);
        let ethSetted = false, xbtcSetted = false;
        for (let i = loanEvents.length - 1; i >= 0; i--) {
            if (!ethSetted && utils.getTokenNameFromAddress(loanEvents[i].args.collateralTokenAddress) === TokenType.ETH) {
                state.currentMinCollateralCoverageRatio.ETH = 100 * parseFloat(ethers.utils.formatEther(loanEvents[i].args.minCollateralCoverageRatio));
                ethSetted = true;
            }
            if (!xbtcSetted && utils.getTokenNameFromAddress(loanEvents[i].args.collateralTokenAddress) === TokenType.xBTC) {
                state.currentMinCollateralCoverageRatio.xBTC = 100 * parseFloat(ethers.utils.formatEther(loanEvents[i].args.minCollateralCoverageRatio));
                xbtcSetted = true;
            }
        };
    }

    return {
        state,
        initChart,
        setInterestRates,
        setGatewayAddress,
        setMinCollateralCoverageRatioForETH,
        setMinCollateralCoverageRatioForXBTC
    }
}


import { reactive } from "vue";
import * as echarts from "echarts";
import { BigNumber, ethers } from "ethers";
import utils from "@/utils";
import { TokenType } from "../types";

export const useConfiguration = async (commonStore: any, whitelistStore: any, pendingStore: any) => {
    const state = reactive({
        administrators: whitelistStore.administrators,
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
        isSetMinCollateralCoverageRatioLoading: false,
    })

    await Promise.all([
        initInterestRateModelParams(),
        initCurrentMinCollateralRatio(),
    ])

    const initChart = () => {
        const chartDom = document.getElementById("interest-model-chart");
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

    const setInterestRateParameters = async () => {
        const terms = state.inputTermList.toString().replace(/\s*/g,"").split(",").map((term) => BigNumber.from(term));
        const interestRates = state.inputInterestRateList.toString().replace(/\s*/g,"").split(",").map((interestRate) => ethers.utils.parseUnits(interestRate, "ether"));
        let tx, result;
        try {
            tx = await commonStore.getInterestRateModel.setLoanParameters(
                commonStore.getTokens.SGC.address,
                terms,
                interestRates,
            );
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set parameters of InterestRateModel failed. (${utils.filterRevertMsg((error as any).message)})`,
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
                message: `Set InterestRateParameters [${state.inputTermList}] => [${state.inputInterestRateList}] success.`,
                color: "success"
            });
            state.isSetInterestRateModelLoading = false;
            pendingStore.decrement();
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set parameters of InterestRateModel failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isSetInterestRateModelLoading = false;
            pendingStore.decrement();
            return
        } 
        try {
            await initInterestRateModelParams();
            state.chartNeedRefresh = true;
        } catch (error) {
            console.error(error);
        }
    }

    const setGatewayAddress = async () => {
        state.currentGatewayAddress = state.inputGatewayAddress;
    }

    const setMinCollateralCoverageRatio = async () => {
        let tx1, tx2, result1, result2;
        try {
            [tx1, tx2] = await Promise.all([
                commonStore.getProtocol.setLoanAndCollateralTokenPair(
                    commonStore.getTokens.SGC.address,
                    commonStore.getTokens.ETH.address,
                    ethers.utils.parseUnits(String(parseFloat(state.inputMinCollateralCoverageRatioOfETH) / 100), "ether"),
                    ethers.utils.parseUnits("0.05", "ether")
                ),
                commonStore.getProtocol.setLoanAndCollateralTokenPair(
                    commonStore.getTokens.SGC.address,
                    commonStore.getTokens.xBTC.address,
                    ethers.utils.parseUnits(String(parseFloat(state.inputMinCollateralCoverageRatioOfXBTC) / 100), "ether"),
                    ethers.utils.parseUnits("0.05", "ether")
                ),
            ])
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set Min CollateralCoverageRatio failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            return;
        }
        try {
            state.isSetMinCollateralCoverageRatioLoading = true;
            pendingStore.increment();
            [result1, result2] = await Promise.all([
                tx1.wait(),
                tx2.wait(),
            ])
            console.log("setMinCollateralCoverageRatio result1: ", result1);
            console.log("setMinCollateralCoverageRatio result2: ", result2);
            pendingStore.enqueue({
                title: "Configuration",
                message: "Set MinCollateralCoverageRatio for collateral token pairs success.",
                color: "success"
            });
            state.isSetMinCollateralCoverageRatioLoading = false;
            pendingStore.decrement();
        } catch (error) {
            console.error(error);
            pendingStore.enqueue({
                title: "Configuration",
                message: `Set Min CollateralCoverageRatio failed. (${utils.filterRevertMsg((error as any).message)})`,
                color: "danger"
            });
            state.isSetMinCollateralCoverageRatioLoading = false;
            pendingStore.decrement();
            return;
        }
        try {
            await initCurrentMinCollateralRatio();
        } catch(error) {
            console.error(error);
        }
    }

    async function initInterestRateModelParams() {
        const rawParams = await commonStore.getInterestRateModel.getLoanParameters(commonStore.tokens.SGC.address);
        const termList = rawParams.termList.map((term: BigNumber) => term.toNumber());
        const interestRateList = rawParams.interestRateList.map((interestRate: BigNumber) => ethers.utils.formatEther(interestRate));
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
        setInterestRateParameters,
        setGatewayAddress,
        setMinCollateralCoverageRatio,
    }
}


import { reactive } from "vue";
import * as echarts from "echarts";

export const useConfiguration = (whitelistStore: any) => {
    const state = reactive({
        administrators: whitelistStore.administrators,
        openAddGatewayAddress: false,
        openAddInterestModel: false,
        openSetMinCCR: false,
        currentGatewayAddress: "0x9489f551e2dd40aA69518D2502Fe394212A0020D",
        gatewayAddressInProposal: "0x13a6D1fe418de7e5B03Fb4a15352DfeA3249eAA4",
        currentMinCCR: 150,
        minCCRInProposal: 130,
        loanParams: {
            termList: [1, 30, 60, 120, 240],
            interestList: [6.5, 8, 10, 11, 13.5],
        }
    })

    const initChartOption = (termList: Array<number>, interestList: Array<number>) => {
        const daysInYear = Array.from({ length: 365 }, (_, i) => i + 1);
        const sgcInterest = [];
        let paramIndex = 0;
        for (let term of daysInYear) {
            if (term >= termList[paramIndex]) {
                if (
                    paramIndex < termList.length - 1 &&
                    term == termList[paramIndex + 1]
                ) {
                    paramIndex++;
                }
                sgcInterest.push(interestList[paramIndex]);
            }
        }

        return {
            title: {
                text: "Loan Inerest(%)",
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
                data: daysInYear,
            },
            yAxis: {
                type: "value",
            },
            series: [
                {
                    name: "SGC",
                    type: "line",
                    step: "start",
                    data: sgcInterest,
                },
            ],
        }
    }

    const initChart = (option: any) => {
        const chartDom = document.getElementById("interest-model-chart");
        const myChart = echarts.init(chartDom!);
        myChart.setOption(option);
    }

    return {
        state,
        initChartOption,
        initChart,
    }
}
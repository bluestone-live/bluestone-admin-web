import { reactive } from "vue";
import { IDecodedTransactionData, ITransactionRecord, NetworkType } from "../types"
import { BigNumber, ethers } from "ethers"
import utils from "@/utils"

export const useTransactions = async (commonStore: any, accountStore: any, transactionsStore: any) => {
    const state = reactive({
        isOwner: accountStore.isOwner,
        networkForEtherscan: "",   // '', 'goerli.', 'sepolia.'
        administrators: transactionsStore.getAdministrators,
        handledTransactions: [] as ITransactionRecord[],
        decodedTransactions: [] as IDecodedTransactionData[],
    })

    const traceToEtherscan = (txHash: string) => {
        window.open(
            `https://${state.networkForEtherscan}etherscan.io/tx/${txHash}`,
            "_blank"
        )
    }

    const isTokenAddress = (key: string) => {
        if (key === "tokenAddress" || key === "collateralTokenAddress" || key === "loanTokenAddress") {
            return true
        } else {
            return false
        }
    }

    const getTokenName = (decodedAddress: string) => {
        return utils.getTokenNameFromAddress(`0x${decodedAddress}`)
    }

    const _initNetworkForEtherscan = () => {
        switch (commonStore.networkType) {
            case NetworkType.Main:
                state.networkForEtherscan = ""
                break
            case NetworkType.Goerli:
                state.networkForEtherscan = "goerli."
                break
            case NetworkType.Sepolia:
                state.networkForEtherscan = "sepolia."
                break
            default:
                state.networkForEtherscan = "unknown."
                break
        }
    }

    const _parseTransactionData = (data: string) => {
        const rawDecodedData = transactionsStore.decoder.decodeData(data)
        if (rawDecodedData.method === "setRates") {
            rawDecodedData.inputs[1] = rawDecodedData.inputs[1].map((term: BigNumber) => term.toNumber())
            rawDecodedData.inputs[2] = rawDecodedData.inputs[2].map((interestRate: BigNumber) => parseFloat(ethers.utils.formatEther(interestRate)))
        }
        if (rawDecodedData.method === "setLoanAndCollateralTokenPair") {
            rawDecodedData.inputs[2] = ethers.utils.formatEther(rawDecodedData.inputs[2])
            rawDecodedData.inputs[3] = ethers.utils.formatEther(rawDecodedData.inputs[3])
        }

        return rawDecodedData
    }

    const _isRejection = (transactionReject: any, transactionPre: any) => {
        if (
            transactionPre.nonce === transactionReject.nonce
        ) {
            return true
        } else {
            return false
        }
    }

    const _isSuspectRejection = (transaction: any) => {
        if (
            transaction.to.toLowerCase() === commonStore.safeInfo.safeAddress.toLowerCase()
            && transaction.data === null
        ) {
            return true
        } else {
            return false
        }
    }

    const parseTransactions = () => {
        // state.handledTransactions = transactionsStore.getRawTransactions.map((rawTransaction: any, index: any) => {
        //     return {
        //         confirmations: rawTransaction.confirmations,
        //         confirmationsRequired: rawTransaction.confirmationsRequired,
        //         data: rawTransaction.data,
        //         decodedData: _parseTransactionData(rawTransaction.data),
        //         executionDate: rawTransaction.executionDate,
        //         executor: rawTransaction.executor,
        //         isExecuted: rawTransaction.isExecuted,
        //         isSuccessful: rawTransaction.isSuccessful,
        //         nonce: rawTransaction.nonce,
        //         safeTxHash: rawTransaction.safeTxHash,
        //         submissionDate: rawTransaction.submissionDate,
        //         to: rawTransaction.to,
        //         transactionHash: rawTransaction.transactionHash,
        //         isRejection: _isRejection(rawTransaction.to, rawTransaction.data),
        //     } as ITransactionRecord
        // })
        const tempArr: ITransactionRecord[] = [];
        const rawTransactions = transactionsStore.getRawTransactions;
        for (let index = 0; index < rawTransactions.length; index++) {
            const rawTransaction = rawTransactions[index]
            let rejectionTag: boolean
            if (_isSuspectRejection(rawTransaction)) {
                if (index < rawTransactions.length - 1 && _isRejection(rawTransactions[index + 1], rawTransaction)) {
                    rejectionTag = true
                } else {
                    continue
                }
            } else {
                rejectionTag = false
            }
            tempArr.push({
                confirmations: rawTransaction.confirmations,
                confirmationsRequired: rawTransaction.confirmationsRequired,
                data: rawTransaction.data,
                decodedData: _parseTransactionData(rawTransaction.data),
                executionDate: rawTransaction.executionDate,
                executor: rawTransaction.executor,
                isExecuted: rawTransaction.isExecuted,
                isSuccessful: rawTransaction.isSuccessful,
                nonce: rawTransaction.nonce,
                safeTxHash: rawTransaction.safeTxHash,
                submissionDate: rawTransaction.submissionDate,
                to: rawTransaction.to,
                transactionHash: rawTransaction.transactionHash,
                isRejection: rejectionTag,
            })
        }
        state.handledTransactions = tempArr
        console.log(state.handledTransactions)
    }

    parseTransactions()

    _initNetworkForEtherscan()

    return {
        state,
        traceToEtherscan,
        isTokenAddress,
        getTokenName,
        parseTransactions
    }
}


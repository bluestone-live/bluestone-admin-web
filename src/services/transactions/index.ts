import { reactive } from "vue";
import { IDecodedTransactionData, ITransactionRecord, NetworkType } from "../types"

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
        return transactionsStore.decoder.decodeData(data)
    }

    const _parseTransactions = () => {
        state.handledTransactions = transactionsStore.getRawTransactions.map((rawTransaction: any) => {
            return {
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
                transactionHash: rawTransaction.transactionHash
            } as ITransactionRecord
        })
        console.log("handledTransactions=", state.handledTransactions)
    }

    _parseTransactions()

    _initNetworkForEtherscan()

    return {
        state,
        traceToEtherscan
    }
}


import { reactive } from "vue";
import { IDecodedTransactionData, IRejectionRecord, ITransactionRecord, NetworkType } from "../types"
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
        const tempArr: ITransactionRecord[] = []
        const rawTransactions = transactionsStore.getRawTransactions
        let rejectionTag: boolean = false
        for (let index = 0; index < rawTransactions.length; index++) {
            const rawTransaction = rawTransactions[index]

            let rejection: IRejectionRecord | null
            if (rejectionTag) {
                const preRawTransaction = rawTransactions[index - 1]
                rejection = {
                    confirmations: preRawTransaction.confirmations,
                    confirmationsRequired: preRawTransaction.confirmationsRequired,
                    executionDate: preRawTransaction.executionDate,
                    executor: preRawTransaction.executor,
                    isExecuted: preRawTransaction.isExecuted,
                    isSuccessful: preRawTransaction.isSuccessful,
                    nonce: preRawTransaction.nonce,
                    safeTxHash: preRawTransaction.safeTxHash,
                    submissionDate: preRawTransaction.submissionDate,
                    to: preRawTransaction.to,
                    transactionHash: preRawTransaction.transactionHash,
                }
                rejectionTag = false
            } else {
                rejection = null
            }

            if (_isSuspectRejection(rawTransaction)) {
                if (index < rawTransactions.length - 1 && _isRejection(rawTransactions[index + 1], rawTransaction)) {
                    rejectionTag = true
                }
                continue
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
                rejection: rejection
            })
        }
        state.handledTransactions = tempArr
    }

    const getStripeColor = (transaction: ITransactionRecord) => {
        if(transaction.isExecuted) {
            if(transaction.isSuccessful) {
                return "gray"
            } else {
                return "danger"
            }
        } else {
            if(transaction.rejection) {
                if(transaction.rejection.isExecuted) {
                    if(transaction.rejection.isSuccessful) {
                        return "gray"
                    } else {
                        return "danger"
                    }
                } else {
                    return "warning"
                }
            }
        }
    }

    const getCollapseIcon = (transaction: ITransactionRecord) => {
        if(transaction.isExecuted) {
            if(transaction.isSuccessful) {
                return "done_all"
            } else {
                return "error"
            }
        } else {
            if(transaction.rejection) {
                if(transaction.rejection.isExecuted) {
                    if(transaction.rejection.isSuccessful) {
                        return "remove_done"
                    } else {
                        return "error"
                    }
                } else {
                    return "cancel"
                }
            } else {
                return "keyboard_double_arrow_right"
            }
        }
    }

    const getCardColor = (transaction: ITransactionRecord) => {
        if(transaction.isExecuted) {
            return "background"
        } else {
            if(transaction.rejection?.isExecuted) {
                return "background"
            } else {
                return "white"
            }
        }
    }

    parseTransactions()

    _initNetworkForEtherscan()

    return {
        state,
        traceToEtherscan,
        isTokenAddress,
        getTokenName,
        parseTransactions,
        getStripeColor,
        getCollapseIcon,
        getCardColor
    }
}


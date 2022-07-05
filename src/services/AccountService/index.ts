import { MetaMaskProvider } from "@/utils/MetaMaskProvider";

export class AccountService {
    constructor(private readonly provider: MetaMaskProvider) { }

    /**
     * Get all accounts
     * @returns A list of accounts in MetaMask
     */
    async getAccounts(): Promise<string[]> {
        return this.provider.ethers.send("eth_requestAccounts", []);
    }
}
import Web3 from "web3";
import {Contract} from "web3-eth-contract";
import {Merchant} from "./Merchant";
import {TransactionConfig, TransactionReceipt} from "web3-core";
import {SCPTransactionDTO} from "./SCPTransactionDTO";

const contractJSONInterface = require("../../build/contracts/SimpleCryptocurrenciesPaymentsManager.json");

export class SCPManager {
    private readonly merchant: Merchant;
    private readonly web3: Web3;
    private readonly address: string;
    private readonly contract: Contract;

    constructor(merchant: Merchant, web3: Web3, address: string) {
        this.merchant = merchant;
        this.web3 = web3;
        this.address = address;
        this.contract = new web3.eth.Contract(contractJSONInterface.abi, this.address);
    }

    public async deposit(value: string): Promise<void> {
        const merchantAddress = this.merchant.getAddress();
        const nonce = await this.generateNonce();
        const gasEstimate = await this.contract.methods.deposit().estimateGas({from: merchantAddress, value});
        const transaction = {
            from: merchantAddress,
            to: this.address,
            value,
            nonce,
            gas: gasEstimate,
            data: this.contract.methods.deposit().encodeABI(),
        };

        await this.sendTransaction(transaction);
    }

    public async createTransaction(value: string): Promise<SCPTransactionDTO> {
        const nonce = await this.generateNonce();
        const merchantAddress = this.merchant.getAddress();
        const gasEstimate = await this.contract.methods.createTransaction(value).estimateGas({from: merchantAddress});
        const transaction = {
            from: merchantAddress,
            to: this.address,
            nonce,
            gas: gasEstimate,
            data: this.contract.methods.createTransaction(value).encodeABI(),
        };
        const transactionReceipt = await this.sendTransaction(transaction);

        return new SCPTransactionDTO(this.contract, transactionReceipt);
    }

    private generateNonce(): Promise<number> {
        // todo add proper handling for concurrent transactions
        const merchantAddress = this.merchant.getAddress();
        return this.web3.eth.getTransactionCount(merchantAddress, "latest");
    }

    private async sendTransaction(transaction: TransactionConfig): Promise<TransactionReceipt> {
        const signedTransaction = await this.web3.eth.accounts.signTransaction(
            transaction,
            this.merchant.getPrivateKey()
        );
        return this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    }
}

import Web3 from "web3";
import {ExchangeRateService} from "./ExchangeRateService";
import {Merchant} from "./Merchant";
import {SCPManager} from "./SCPManager";
import {TransactionDetails} from "./TransactionDetails";
import {EcommerceBridgeConfig} from "./EcommerceBridgeConfig";

interface IInitializeTransactionData {
    web3: Web3;
    merchant: Merchant;
    contractAddress: string;
    transactionDetails: TransactionDetails;
    exchangeRateServiceApiKey: string;
}

interface IInitializeTransactionResult {
    finalizeTransactionUrl: string;
    transactionContractAddress: string;
}

export class InitializeTransactionProcess {
    private readonly data: IInitializeTransactionData;

    constructor(data: IInitializeTransactionData) {
        this.data = data;
    }

    public async execute(): Promise<IInitializeTransactionResult> {
        const value = await this.getTransactionValue();
        const scpManager = new SCPManager(this.data.merchant, this.data.web3, this.data.contractAddress);
        await scpManager.deposit(value);
        const transaction = await scpManager.createTransaction(value);
        const transactionContractAddress = await transaction.getTransactionContractAddress();

        return {
            finalizeTransactionUrl: `${EcommerceBridgeConfig.getFinalizeTransactionAppUrl()}/transaction/${transactionContractAddress}`,
            transactionContractAddress,
        };
    }

    protected async getTransactionValue(): Promise<string> {
        const exchangeRateService = new ExchangeRateService(this.data.exchangeRateServiceApiKey);
        const transactionDetails = this.data.transactionDetails;
        const etherExchangeRate = await exchangeRateService.getEtherExchangeRate(transactionDetails.getCurrency());
        const depositMultiplier = 2;
        const transactionValueInEther = depositMultiplier * Number(transactionDetails.getValue()) * etherExchangeRate;

        return this.data.web3.utils.toWei(transactionValueInEther.toString(), "ether");
    }
}

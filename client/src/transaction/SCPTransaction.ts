import {Contract} from "web3-eth-contract";
import Web3 from "web3";
import {TransactionState} from "./TransactionState";

const contractJSONInterface = require("../../../build/contracts/SimpleCryptocurrenciesPaymentsTransaction.json");

export class SCPTransaction {
    private readonly customerAccountAddress: string;
    private readonly scpAddress: string;
    private readonly web3: Web3;
    private readonly contract: Contract;

    constructor(customerAccountAddress: string, scpAddress: string, contractAddress: string, provider: any) {
        this.customerAccountAddress = customerAccountAddress;
        this.scpAddress = scpAddress;
        this.web3 = new Web3(provider);
        this.contract = new this.web3.eth.Contract(contractJSONInterface.abi, contractAddress);
    }

    public async getState(): Promise<TransactionState> {
        return this.contract.methods.state().call({from: this.scpAddress});
    }

    public async getMerchantAddress(): Promise<string> {
        return this.contract.methods.merchant().call({from: this.scpAddress});
    }

    public async getClientAddress(): Promise<string> {
        return this.contract.methods.client().call({from: this.scpAddress});
    }

    public async confirmTransaction(): Promise<void> {
        const depositValue = await this.getDepositValue();
        const gasEstimate = await this.contract.methods
            .confirmTransaction()
            .estimateGas({from: this.customerAccountAddress, value: depositValue});

        await this.contract.methods.confirmTransaction().send({
            from: this.customerAccountAddress,
            value: depositValue,
            gas: gasEstimate,
        });
    }

    private async getDepositValue(): Promise<string> {
        const value = await this.contract.methods.value().call({from: this.scpAddress});
        const depositMultiplier = this.web3.utils.toBN(2);
        return this.web3.utils.toBN(value).mul(depositMultiplier).toString();
    }

    public async confirmReceived(): Promise<void> {
        const gasEstimate = await this.contract.methods
            .confirmReceived()
            .estimateGas({from: this.customerAccountAddress});

        await this.contract.methods.confirmReceived().send({
            from: this.customerAccountAddress,
            gas: gasEstimate,
        });
    }
}

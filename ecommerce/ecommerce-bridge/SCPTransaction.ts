import Web3 from "web3";
import {Contract} from "web3-eth-contract";
import {TransactionState} from "./TransactionState";

const contractJSONInterface = require("../../build/contracts/SimpleCryptocurrenciesPaymentsTransaction.json");

export class SCPTransaction {
    private readonly web3: Web3;
    private readonly contract: Contract;
    private readonly scpAddress: string;

    constructor(web3: Web3, contractAddress: string, scpAddress: string) {
        this.web3 = web3;
        this.contract = new this.web3.eth.Contract(contractJSONInterface.abi, contractAddress);
        this.scpAddress = scpAddress;
    }

    public async getState(): Promise<TransactionState> {
        return this.contract.methods.state().call({from: this.scpAddress});
    }
}

import {Contract} from "web3-eth-contract";
import {TransactionReceipt} from "web3-core";

export class SCPTransactionDTO {
    private readonly contract: Contract;
    private readonly transactionReceipt: TransactionReceipt;

    constructor(contract: Contract, transactionReceipt: TransactionReceipt) {
        this.contract = contract;
        this.transactionReceipt = transactionReceipt;
    }

    public async getTransactionContractAddress(): Promise<string> {
        // todo optimize, get event based on transaction logs
        const transactionCreatedEvents = await this.contract.getPastEvents("TransactionCreated", {
            fromBlock: this.transactionReceipt.blockNumber,
            toBlock: this.transactionReceipt.blockNumber,
        });
        const transactionCreatedEvent = transactionCreatedEvents.find((event) => {
            return event.transactionHash === this.transactionReceipt.transactionHash;
        });

        return transactionCreatedEvent.returnValues.transaction;
    }
}

import Web3 from "web3";
import commandLineArgs from "command-line-args";
import {InitializeTransactionProcess} from "./InitializeTransactionProcess";
import {Merchant} from "./Merchant";
import {TransactionDetails} from "./TransactionDetails";
import {EcommerceBridgeConfig} from "./EcommerceBridgeConfig";
import {EcommerceBridgeAction} from "./EcommerceBridgeAction";
import {SCPTransaction} from "./SCPTransaction";

const optionDefinitions = [
    {name: "action", type: String},
    {name: "merchantPrivateKey", type: String},
    {name: "merchantAddress", type: String},
    {name: "value", type: String},
    {name: "currency", type: String},
    {name: "transactionContractAddress", type: String},
];
const input = commandLineArgs(optionDefinitions);

const networkUrl = EcommerceBridgeConfig.getEthereumNetworkUrl();
const web3 = new Web3(networkUrl);

async function main() {
    switch (input.action) {
        case EcommerceBridgeAction.INITIALIZE_TRANSACTION: {
            const merchant = new Merchant(input.merchantPrivateKey, input.merchantAddress);
            const initializeTransactionProcess = new InitializeTransactionProcess({
                web3,
                merchant,
                contractAddress: EcommerceBridgeConfig.getContractAddress(),
                transactionDetails: new TransactionDetails(input.value, input.currency),
                exchangeRateServiceApiKey: EcommerceBridgeConfig.getExchangeRateServiceApiKey(),
            });
            const result = await initializeTransactionProcess.execute();

            process.stdout.write(JSON.stringify(result));
            break;
        }
        case EcommerceBridgeAction.GET_TRANSACTION_CONTRACT_STATE: {
            const scpTransaction = new SCPTransaction(
                web3,
                input.transactionContractAddress,
                EcommerceBridgeConfig.getSCPAddress()
            );
            const result = {
                state: await scpTransaction.getState(),
            };

            process.stdout.write(JSON.stringify(result));
            break;
        }
        default: {
            throw new Error("Unknown action.");
        }
    }
}

main();

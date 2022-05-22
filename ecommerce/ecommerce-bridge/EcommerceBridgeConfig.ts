export class EcommerceBridgeConfig {
    public static getEthereumNetworkUrl(): string {
        return process.env.ETHEREUM_NETWORK_URL || "https://ropsten.infura.io/v3/24818343ec194b7ea50ddeeaefad313c";
    }

    public static getExchangeRateServiceApiKey(): string {
        return (
            process.env.EXCHANGE_RATE_SERVICE_API_KEY ||
            "efd6b5449fda243aebe877a568c4c1c340d5440f2ca4576daf31a4bb8db26b5e"
        );
    }

    public static getContractAddress(): string {
        return process.env.CONTRACT_ADDRESS || "0xCE0c5c4E1e19CEBB36ED145e0b8735C3BDE19Ef4";
    }

    public static getSCPAddress(): string {
        return process.env.SCP_ADDRESS || "0x27e2d81Cb2dE1E2eac6294c11C502D54f0cFEA4c";
    }

    public static getFinalizeTransactionAppUrl(): string {
        return process.env.FINALIZE_TRANSACTION_APP_URL || "http://localhost:9000";
    }
}

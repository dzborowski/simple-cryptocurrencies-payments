import axios from "axios";

export class ExchangeRateService {
    private readonly exchangeRateServiceApiKey: string;

    constructor(exchangeRateServiceApiKey: string) {
        this.exchangeRateServiceApiKey = exchangeRateServiceApiKey;
    }

    public async getEtherExchangeRate(fromCurrency: string): Promise<number> {
        return this.getExchangeRate(fromCurrency, "ETH");
    }

    protected async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${fromCurrency}&tsyms=${toCurrency}&api_key=${this.exchangeRateServiceApiKey}`;
        const response = await axios.get<{[toCurrency: string]: number}>(url);
        return response.data[toCurrency];
    }
}

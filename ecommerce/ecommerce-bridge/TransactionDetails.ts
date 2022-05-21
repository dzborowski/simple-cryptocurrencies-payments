export class TransactionDetails {
    private readonly value: string;
    private readonly currency: string;

    constructor(value: string, currency: string) {
        if (!value) {
            throw new Error("value is required.");
        }

        if (!currency) {
            throw new Error("currency is required.");
        }

        this.value = value;
        this.currency = currency;
    }

    public getValue(): string {
        return this.value;
    }

    public getCurrency(): string {
        return this.currency;
    }
}

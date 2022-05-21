export class Merchant {
    private readonly privateKey: string;
    private readonly address: string;

    constructor(privateKey: string, address: string) {
        if (!privateKey) {
            throw new Error("privateKey is required.");
        }

        if (!address) {
            throw new Error("address is required.");
        }

        this.privateKey = privateKey;
        this.address = address;
    }

    public getPrivateKey(): string {
        return this.privateKey;
    }

    public getAddress(): string {
        return this.address;
    }
}

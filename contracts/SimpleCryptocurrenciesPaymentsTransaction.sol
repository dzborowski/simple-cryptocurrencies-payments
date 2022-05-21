// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

contract SimpleCryptocurrenciesPaymentsTransaction {
    uint public value;
    address payable public merchant;
    address payable public client;

    enum State { Created, Locked, Finished, Inactive }
    State public state = State.Created;

    event TransactionAborted();
    event TransactionConfirmed();
    event ItemReceived();
    event MerchantRefunded();

    constructor(address merchant_) payable {
        require(msg.value % 2 == 0, "`msg.value` must be an even number.");

        merchant = payable(merchant_);
        value = msg.value / 2;
    }

    function abortTransaction() public {
        require(state == State.Created);
        require(msg.sender == merchant, "Only merchant can abort transaction.");

        emit TransactionAborted();

        state = State.Inactive;
        merchant.transfer(address(this).balance);
    }

    function confirmTransaction() public payable {
        require(state == State.Created);
        require(msg.value == (2 * value), "You need have to put twice the value of the item into the contract as deposit.");

        emit TransactionConfirmed();

        state = State.Locked;
        client = payable(msg.sender);
    }

    function confirmReceived() public {
        require(msg.sender == client, "Only client can confirm receipt of item.");
        require(state == State.Locked);

        emit ItemReceived();

        state = State.Finished;
        client.transfer(value);
        merchant.transfer(3 * value);
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

import "./SimpleCryptocurrenciesPaymentsTransaction.sol";

contract SimpleCryptocurrenciesPaymentsManager {
    SimpleCryptocurrenciesPaymentsTransaction[] public transactions;
    mapping(address => uint) public balances;

    event Deposit(address sender, uint value);
    event Withdrawal(address receiver, uint value);
    event TransactionCreated(address sender, uint value, address transaction);

    function deposit() public payable {
        emit Deposit(msg.sender, msg.value);
        
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint value) public {
        require(balances[msg.sender] >= value, "Insufficient funds.");

        emit Withdrawal(msg.sender, value);

        balances[msg.sender] -= value;
        payable(msg.sender).transfer(value);
    }


    function createTransaction(uint value) public returns (address) {
        require(balances[msg.sender] >= value, "Insufficient funds.");

        balances[msg.sender] -= value;
        SimpleCryptocurrenciesPaymentsTransaction transaction = (new SimpleCryptocurrenciesPaymentsTransaction){value: value}(msg.sender);
        transactions.push(transaction);
        address transactionContractAddress = address(transaction);

        emit TransactionCreated(msg.sender, value, transactionContractAddress);

        return transactionContractAddress;
    }
}

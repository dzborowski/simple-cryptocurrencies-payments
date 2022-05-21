import {useParams, useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {TransactionState} from "../TransactionState";
import {SCPTransaction} from "../SCPTransaction";
import axios from "axios";
import "./TransactionView.css";
import {Button, PageHeader, Steps} from "antd";
import {FileDoneOutlined, LockOutlined, LoadingOutlined, SmileOutlined} from "@ant-design/icons";

// todo add error handling, support TransactionState.Inactive
export function TransactionView() {
    const {transactionContractAddress} = useParams();
    const [searchParams] = useSearchParams();
    const [merchantAccountAddress, setMerchantAccountAddress] = useState("");
    const [clientAccountAddress, setClientAccountAddress] = useState("");
    const [customerAccountAddress, setCustomerAccountAddress] = useState("");
    const [transactionState, setTransactionState] = useState(TransactionState.Created);
    const [confirmTransactionLoading, setConfirmTransactionLoading] = useState(false);
    const [confirmReceivedLoading, setConfirmReceivedLoading] = useState(false);
    const scpTransaction = new SCPTransaction(
        customerAccountAddress,
        process.env.REACT_APP_SCP_ADDRESS,
        transactionContractAddress,
        window.ethereum
    );

    useEffect(() => {
        refreshTransactionState();
        scpTransaction.getMerchantAddress().then((merchantAddress) => {
            setMerchantAccountAddress(merchantAddress);
        });
        scpTransaction.getClientAddress().then((clientAddress) => {
            setClientAccountAddress(clientAddress);
        });
        window.ethereum.request<string[]>({method: "eth_accounts"}).then((accounts) => {
            handleAccountsChanged(accounts);
        });
        window.ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, []);

    async function refreshTransactionState() {
        const newTransactionState = await scpTransaction.getState();
        setTransactionState(newTransactionState);
    }

    function handleAccountsChanged(accounts: string[]) {
        if (accounts.length && accounts[0] !== customerAccountAddress) {
            setCustomerAccountAddress(accounts[0]);
        }
    }

    async function handleConfirmTransaction() {
        try {
            const confirmTransactionWebhookUrl = searchParams.get("confirmTransactionWebhookUrl");
            setConfirmTransactionLoading(true);
            await connectAccount();
            await scpTransaction.confirmTransaction();
            await refreshTransactionState();
            const clientAddress = await scpTransaction.getClientAddress();
            setClientAccountAddress(clientAddress);
            await axios.post(confirmTransactionWebhookUrl);
        } finally {
            setConfirmTransactionLoading(false);
        }
    }

    async function handleConfirmReceived() {
        try {
            setConfirmReceivedLoading(true);
            await connectAccount();
            await scpTransaction.confirmReceived();
            await refreshTransactionState();
        } finally {
            setConfirmReceivedLoading(false);
        }
    }

    async function connectAccount() {
        const accounts = await window.ethereum.request<string[]>({method: "eth_requestAccounts"});
        handleAccountsChanged(accounts);
    }

    function getAvailableActions() {
        switch (transactionState) {
            case TransactionState.Created: {
                return (
                    <Button type="primary" block onClick={handleConfirmTransaction} loading={confirmTransactionLoading}>
                        Confirm transaction
                    </Button>
                );
            }
            case TransactionState.Locked: {
                return (
                    <Button type="primary" block onClick={handleConfirmReceived} loading={confirmReceivedLoading}>
                        Confirm received
                    </Button>
                );
            }
        }
    }

    const headerTitle = `Transaction contract address: ${transactionContractAddress}`;

    return (
        <div className={"TransactionView"}>
            <PageHeader className="site-page-header" title={headerTitle} />

            <Steps className="transaction-state" current={Number.parseInt(transactionState)}>
                <Steps.Step
                    icon={<FileDoneOutlined />}
                    title="Created"
                    description={`Transaction was created by ${merchantAccountAddress}`}
                />
                <Steps.Step
                    icon={confirmTransactionLoading ? <LoadingOutlined /> : <LockOutlined />}
                    title="Locked"
                    description={`Transaction was locked by ${clientAccountAddress}`}
                />
                <Steps.Step
                    icon={confirmReceivedLoading ? <LoadingOutlined /> : <SmileOutlined />}
                    title="Finished"
                    description={`Transaction was confirmed by ${clientAccountAddress}`}
                />
            </Steps>

            <div className={"available-actions-wrapper"}>
                <div className={"available-actions"}>{getAvailableActions()}</div>
            </div>
        </div>
    );
}

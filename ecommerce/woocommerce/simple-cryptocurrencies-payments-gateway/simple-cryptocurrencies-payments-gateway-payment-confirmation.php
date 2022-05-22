<?php

add_action('woocommerce_api_scp-payment-confirmation', 'payment_confirmation_handler');

function payment_confirmation_handler()
{
    header("Access-Control-Allow-Origin: http://localhost:9000");

    global $woocommerce;

    abstract class TransactionState
    {
        const Created = "0";
        const Locked = "1";
        const Finished = "2";
        const Inactive = "3";
    }

    try {
        $action = "GET_TRANSACTION_CONTRACT_STATE";
        $order_id = intval($_GET["orderId"]);
        $transaction_contract_address = $_GET["transactionContractAddress"];
        $order = new WC_Order($order_id);

        if ($order->get_meta('transaction_contract_address') !== $transaction_contract_address) {
            http_response_code(400);
            return;
        }

        $command = "node --no-deprecation ecommerce-bridge.js --action={$action} --transactionContractAddress={$transaction_contract_address}";
        $result = exec("cd " . __DIR__ . "; {$command} 2>&1", $out, $err);
        $decoded_result = json_decode($result, true);
        $state = $decoded_result['state'];

        if ($state == TransactionState::Locked) {
            $order->payment_complete();
        }
    } catch (Exception $exception) {
        echo 'Caught exception: ',  $exception->getMessage(), "\n";
    }

    exit;
}

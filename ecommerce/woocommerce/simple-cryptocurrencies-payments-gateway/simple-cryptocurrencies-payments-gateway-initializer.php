<?php

add_action('plugins_loaded', 'init_simple_cryptocurrencies_payments_gateway');

function init_simple_cryptocurrencies_payments_gateway()
{
    class SimpleCryptocurrenciesPaymentsGateway extends WC_Payment_Gateway
    {
        public function __construct()
        {
            $this->id = 'simple_cryptocurrencies_payments_gateway';
            $this->icon = '';
            $this->has_fields = true;
            $this->method_title = 'Simple cryptocurrencies payments gateway';
            $this->method_description = 'Pay using cryptocurrencies.';

            $this->supports = array(
                'products'
            );

            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->enabled = $this->get_option('enabled');

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
        }

        public function init_form_fields()
        {
            $this->form_fields = array(
                'enabled' => array(
                    'title'       => 'Enable/Disable',
                    'type'        => 'checkbox',
                    'description' => 'Enable simple cryptocurrencies payments gateway.',
                    'default'     => 'no'
                ),
                'title' => array(
                    'title'       => 'Title',
                    'type'        => 'text',
                    'description' => 'The title which the user sees during checkout.',
                    'default'     => 'Simple cryptocurrencies payments',
                ),
                'description' => array(
                    'title'       => 'Description',
                    'type'        => 'textarea',
                    'description' => 'The description which the user sees during checkout.',
                    'default'     => 'Pay using cryptocurrencies.',
                ),
            );
        }

        public function process_payment($order_id)
        {
            global $woocommerce;
            $order = new WC_Order($order_id);

            $order->update_status('on-hold', __('Awaiting payment', 'woocommerce'));
            $woocommerce->cart->empty_cart();

            $this->initialize_payment_transaction($order);

            return array(
                'result' => 'success',
                'redirect' => $this->get_return_url($order)
            );
        }

        private function initialize_payment_transaction($order)
        {
            try {
                $action = "INITIALIZE_TRANSACTION";
                $merchant_private_key = getenv("MERCHANT_PRIVATE_KEY");
                $merchant_address = getenv("MERCHANT_ADDRESS");
                $value = $order->get_total();
                $currency = $order->get_currency();

                $command = "node --no-deprecation ecommerce-bridge.js --action={$action} --merchantPrivateKey={$merchant_private_key} --merchantAddress={$merchant_address} --value={$value} --currency={$currency}";
                $result = exec("cd " . __DIR__ . "; {$command} 2>&1", $out, $err);
                $decoded_result = json_decode($result, true);
                $finalize_payment_transaction_url = $decoded_result['finalizeTransactionUrl'];
                $transaction_contract_address = $decoded_result['transactionContractAddress'];

                $order_id = $order->get_id();
                $confirm_transaction_webhook_url = get_site_url() . "/wc-api/scp-payment-confirmation?orderId={$order_id}&transactionContractAddress={$transaction_contract_address}";
                $encoded_confirm_transaction_webhook_url = urlencode($confirm_transaction_webhook_url);

                $finalize_payment_transaction_url .= "?confirmTransactionWebhookUrl={$encoded_confirm_transaction_webhook_url}";

                $order->update_meta_data('transaction_contract_address', $transaction_contract_address);
                $order->update_meta_data('finalize_payment_transaction_url', esc_attr($finalize_payment_transaction_url));
                $order->save();
            } catch (Exception $exception) {
                echo 'Caught exception: ',  $exception->getMessage(), "\n";
            }
        }
    }
}

function add_simple_cryptocurrencies_payments_gateway($methods)
{
    $methods[] = 'SimpleCryptocurrenciesPaymentsGateway';
    return $methods;
}

add_filter('woocommerce_payment_gateways', 'add_simple_cryptocurrencies_payments_gateway');

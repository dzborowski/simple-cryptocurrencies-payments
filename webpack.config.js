const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./ecommerce/ecommerce-bridge/ecommerce-bridge.ts",
    target: "node",
    resolve: {
        extensions: [".js", ".ts", ".json"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ["ts-loader"],
            },
        ],
    },
    plugins: [new webpack.IgnorePlugin({resourceRegExp: /^electron$/})],
    output: {
        path: path.join(__dirname, "ecommerce", "woocommerce", "simple-cryptocurrencies-payments-gateway"),
        filename: "ecommerce-bridge.js",
    },
};

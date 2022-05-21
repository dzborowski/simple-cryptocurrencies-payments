const SimpleCryptocurrenciesPaymentsManager = artifacts.require("SimpleCryptocurrenciesPaymentsManager");

module.exports = function (deployer) {
    deployer.deploy(SimpleCryptocurrenciesPaymentsManager);
};

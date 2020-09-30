const TestMainToken = artifacts.require("./TestMainToken");

module.exports = function (deployer) {
  deployer.deploy(TestMainToken);
};

const TestToken = artifacts.require("Token");

module.exports = function (deployer) {
  // if(deployer.network_id === 5777){
  deployer.deploy(TestToken, 'TestToken', 'TEST');
  // }
  // return;
};

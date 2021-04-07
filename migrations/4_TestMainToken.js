const TestMainToken = artifacts.require("Token");

module.exports = function (deployer) {
  // if(deployer.network_id === 5777){
  deployer.deploy(TestMainToken, 'TestMainToken', 'TESTM');
  // }
  // return;
};

const TestToken = artifacts.require("./TestToken");

module.exports = function (deployer) {
  //if(deployer.network_id === 5777){
  deployer.deploy(TestToken);
  //}
  //return;
};

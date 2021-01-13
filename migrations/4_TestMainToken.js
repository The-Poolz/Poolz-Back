const TestMainToken = artifacts.require("./TestMainToken");

module.exports = function (deployer) {
  //if(deployer.network_id === 5777){
  deployer.deploy(TestMainToken);
  //}
  //return;
};

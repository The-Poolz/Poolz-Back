const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  if(deployer.network_id === 5777){
  deployer.deploy(Migrations/*, {gas: 42949672 }*/);
  }
  return;
};

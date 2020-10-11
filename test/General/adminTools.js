const ThePoolz = artifacts.require("ThePoolz");
const { assert } = require('chai');


contract("Admin tools", function () {
    let instance ;
    let accounts;
    it("Check Balance, internal vs erc20", async () => {
        instance = await ThePoolz.new();
        accounts = await web3.eth.getAccounts();
        let min = 500;
        await instance.SetMinDuration(min,{from: accounts[0] });
        let actual = await instance.GetMinDuration();
        assert.equal(actual.toNumber(),min);
    });
  });
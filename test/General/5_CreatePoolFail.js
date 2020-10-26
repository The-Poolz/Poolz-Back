const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const truffleAssert = require('truffle-assertions');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = 1;
const amount = 10000000;

contract("Create Pool Fails", async accounts => {
    it("Fail Open finshed pool", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() - 1);   // sub a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) - 2000, rate, rate, amount, false, zero_address,false, { from: accounts[0] }));
      });
      it("No price", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.SetPoolPrice(1, {from : accounts[0]});
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,false, { from: accounts[0] }));
      });
      it("Invalid Poz Rate", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, 2*rate, amount, false, zero_address,false, { from: accounts[0] }));
      });
      it("Poz Rate = 0", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, 0, amount, false, zero_address,false, { from: accounts[0] }));
      });
      it("fail get pool data", async () => {
        let instance = await ThePoolz.new();
        await truffleAssert.reverts(instance.GetPoolData(99));
      });
      it("fail get more pool data", async () => {
        let instance = await ThePoolz.new();
        await truffleAssert.reverts(instance.GetMorePoolData(99));
      });
      it("fail get pool status", async () => {
        let instance = await ThePoolz.new();
        await truffleAssert.reverts(instance.GetPoolStatus(99));
      });
});
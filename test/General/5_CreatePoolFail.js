const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const truffleAssert = require('truffle-assertions');
const zero_address = "0x0000000000000000000000000000000000000000";
var BN = web3.utils.BN;

const rate = new BN('1000000000'); // with decimal21 (shifter) 1 eth^18 = 1 token^6
const amount = new BN('3000000'); //3 tokens for sale
//const invest = web3.utils.toWei('1', 'ether'); //1eth;

contract("Create Pool Fails", async accounts => {
    it("Fail Open finshed pool", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() - 1);   // sub a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) - 2000, rate, rate, amount, false, zero_address,true,0, { from: accounts[0] }));
      });
      it("Fail Open pool, Token Filter ", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.SwapTokenFilter({ from: accounts[0] });
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) - 2000, rate, rate, amount, false, zero_address,true,0, { from: accounts[0] }));
      });
      it("No price", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.SetPoolPrice(1, {from : accounts[0]});
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,true,0, { from: accounts[0] }));
      });
      it("Invalid Poz Rate", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, 2*rate, rate, amount, false, zero_address,true,0, { from: accounts[0] }));
      });
      it("No Poz Rate", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, 0, 0, amount, false, zero_address,true,0, { from: accounts[0] }));
      });
      it("Poz Rate = 0", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, 0, amount, false, zero_address,true,0, { from: accounts[0] }));
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
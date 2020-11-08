const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
var BN = web3.utils.BN;
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = new BN(' '); //1eth = 420TEST with decimal21
const amount = new BN('15000000000'); //150,000 test token
const invest = web3.utils.toWei('1', 'ether'); //1eth

contract("Thepoolz, Invest", async accounts => {
    it("open a day long pool, check balance", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,false, { from: accounts[0] });
      });
      it("open a day long pool decimal21, invest", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,true, { from: accounts[0] });
        await instance.InvestETH(0,{ value: invest, from: accounts[0] });
        let tokensInContract = await Token.balanceOf(instance.address);
        assert.equal(tokensInContract.toString(), "14958000001", "Got the tokens");
      });
});
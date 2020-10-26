const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = 1;
const amount = 10000000;
const invest = 100000;

contract("Thepoolz, Invest", async accounts => {
    it("open a day long pool, check balance", async () => {
        let instance = await ThePoolz.new();
        let Token = await TestToken.deployed()
        await Token.approve(instance.address, amount, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,false, { from: accounts[0] });
      });
});
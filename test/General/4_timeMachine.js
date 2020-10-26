

const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
//const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = 1;
const amount = 10000000;

contract("Thepoolz, with timeMachine", async accounts => {
  it("take leftovers from finish pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let StartBalance = await Token.balanceOf(accounts[0]);
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,false, { from: accounts[0] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.WithdrawLeftOvers(0, { from: accounts[0] });
    let EndBalance = await Token.balanceOf(accounts[0]);
    assert.equal(EndBalance.toNumber(), StartBalance.toNumber());
  });
  it("Work for take leftovers on finish pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let StartBalance = await Token.balanceOf(accounts[0]);
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,false, { from: accounts[0] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.Work();
    let EndBalance = await Token.balanceOf(accounts[0]);
    assert.equal(EndBalance.toNumber(), StartBalance.toNumber());
  });
  it("Work for take leftovers and investor on finish pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let StartBalance = await Token.balanceOf(accounts[1]);
    assert.equal(StartBalance.toNumber(), 0);
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, zero_address,false, { from: accounts[0] });
    await instance.InvestETH(0, { value: amount / 2, from: accounts[1] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.Work();
    //await instance.WithdrawInvestment(0);
    let EndBalance = await Token.balanceOf(accounts[1]);
    assert.isAbove(EndBalance.toNumber(), 0);
  });
});
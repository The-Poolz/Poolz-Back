const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = 1;
const amount = 10000000;
const invest = 100000;

contract("Thepoolz", async accounts => {
  it("give allownce of 121", async () => {
    const allow = 121;
    let Token = await TestToken.deployed();
    await Token.approve(accounts[0], allow, { from: accounts[8] });
    let allownce = await Token.allowance(accounts[8], accounts[0]);
    assert.equal(allownce, allow);
  });
  it("mint test token", async () => {
    let Token = await TestToken.deployed();
    let oldBalance = await Token.balanceOf(accounts[8]);
    assert.equal(oldBalance,0)
    await Token.FreeTest({from: accounts[8]});
    let newBalance = await Token.balanceOf(accounts[8]);
    assert.isAbove(newBalance.toNumber(),0);
  });
  it("show no pools", async () => {
    let instance = await ThePoolz.deployed();
    let mypools = await instance.GetMyPoolsId({ from: accounts[7] });
    assert.equal(mypools, 0);
    mypools = await instance.GetLastPoolId();
    assert.equal(mypools, 0);
  });
  it("open a day long pool, check balance", async () => {
    let instance = await ThePoolz.deployed();
    let Token = await TestToken.deployed()
    await Token.approve(instance.address, amount, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,false, { from: accounts[0] });
    let newpools = await instance.GetMyPoolsId({ from: accounts[0] });
    assert.equal(newpools.length, 1, "Got 1 pool");
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract, amount, "Got the tokens");
  });
  it("Fail invest 0 eth", async () => {
    let instance = await ThePoolz.deployed();
    await truffleAssert.reverts(instance.InvestETH(0, { value: 0, from: accounts[1] }));
  });
    it("fail to take LeftOvers before time", async () => {
    let instance = await ThePoolz.deployed();
    let took = await instance.WithdrawLeftOvers.call(0, { from: accounts[0] });
    assert.isFalse(took);
  });
  it("invest, check balance", async () => {
    let instance = await ThePoolz.deployed();
    let Token = await TestToken.deployed();
    await instance.InvestETH(0, { value: invest, from: accounts[1] });
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract.toNumber(), amount - invest * rate, "Got the tokens");
  });
  it("Fail, withdraw invesmt", async () => {
    let instance = await ThePoolz.deployed();
    let took = await instance.WithdrawInvestment.call(0, { from: accounts[1] });
    assert.isFalse(took);
  });
  it("open a day long pool, invest, check creator balance", async () => {
    let instance = await ThePoolz.deployed();
    let beforeBalance = await web3.eth.getBalance(accounts[0]);
    await instance.InvestETH(0, { value: invest, from: accounts[1] });
    let afterBalance = await web3.eth.getBalance(accounts[0]);
    assert.isAbove(afterBalance - beforeBalance, 0, "Got the eth minus fee");
    let myinvest = await instance.GetMyInvestmentIds({ from: accounts[1] });
    assert.isAbove(myinvest.length, 0);
  });
  it("Buy all - check status", async () => {
    let instance = await ThePoolz.deployed();
    let Token = await TestToken.deployed();
    await instance.InvestETH(0, { value: amount - 2*invest, from: accounts[1] });
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),4);
  });
  it("take fee", async () => {
    let instance = await ThePoolz.deployed();
    let beforeBalance = await web3.eth.getBalance(instance.address);
    assert.notEqual(beforeBalance,0);
    await instance.WithdrawETHFee(accounts[0], { from: accounts[0] });
    let afterBalance = await web3.eth.getBalance(instance.address);
    assert.equal(afterBalance,0);
  });
  it("check fail attemts, open pool with no allow", async () => {
    let instance = await ThePoolz.deployed();
    let Token = await TestToken.deployed();
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address, { from: accounts[0] }));
  });
  it("check fail attemts, send ETH to contract", async () => {
    let instance = await ThePoolz.deployed();
    await truffleAssert.reverts(instance.send(invest, { from: accounts[0] }));
  });
  it("Should allow send ETH", async () => {
    let instance = await ThePoolz.deployed();
    await instance.SwitchIsPayble({ from: accounts[0] });
    let IsPayble = await instance.GetIsPayble();
    assert.isTrue(IsPayble);
    let startBalance = await web3.eth.getBalance(instance.address);
    await instance.send(amount, { from: accounts[0] });
    let actualBalance = await web3.eth.getBalance(instance.address);
    assert.equal(actualBalance-startBalance, amount);
  });
});

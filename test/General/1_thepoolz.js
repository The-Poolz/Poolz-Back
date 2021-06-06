const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";
var BN = web3.utils.BN;

const rate = new BN('1000000000'); // with decimal21 (shifter) 1 eth^18 = 1 token^6
const amount = new BN('3000000'); //3 tokens for sale
const invest = web3.utils.toWei('1', 'ether'); //1eth;

contract("Thepoolz", async accounts => {
  let instance, Token;

  before(async () => {
    instance = await ThePoolz.deployed();
    Token = await TestToken.new('TestToken', 'TEST');
  })

  it("give allownce of 121", async () => {
    const allow = 121;
    await Token.approve(accounts[0], allow, { from: accounts[8] });
    let allownce = await Token.allowance(accounts[8], accounts[0]);
    assert.equal(allownce, allow);
  });
  it("mint test token", async () => {
    let oldBalance = await Token.balanceOf(accounts[8]);
    assert.equal(oldBalance,0)
    await Token.FreeTest({from: accounts[8]});
    let newBalance = await Token.balanceOf(accounts[8]);
    assert.isAbove(newBalance.toNumber(),0);
  });
  it("show no pools", async () => {
    let mypools = await instance.poolsCount.call();
    assert.equal(mypools, 0);
  });
  it("open a day long pool, check balance", async () => {
    await Token.approve(instance.address, amount, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: accounts[0] });
    let newpools = await instance.poolsCount.call();
    assert.equal(newpools.length, 1, "Got 1 pool");
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract.toString(), amount.toString(), "Got the tokens");
  });
  it("Fail invest 0 eth", async () => {
    await truffleAssert.reverts(instance.InvestETH(0, { value: 0, from: accounts[1] }));
  });
    it("fail to take LeftOvers before time", async () => {
    let took = await instance.WithdrawLeftOvers.call(0, { from: accounts[0] });
    assert.isFalse(took);
  });
  it("invest, check balance", async () => {
    await instance.InvestETH(0, { value: invest, from: accounts[1] }); //3-1
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract.toString(),'2000000'  , "Got the tokens"); //2 left
  });
  it("open a day long pool, invest, check creator balance", async () => {
    let beforeBalance = await web3.eth.getBalance(accounts[0]);
    await instance.InvestETH(0, { value: invest, from: accounts[1] }); //2-1
    let afterBalance = await web3.eth.getBalance(accounts[0]);
    assert.isAbove(afterBalance - beforeBalance, 0, "Got the eth minus fee");
    let myinvest = await instance.GetMyInvestmentIds({ from: accounts[1] });
    assert.isAbove(myinvest.length, 0);
  });
  it("Buy all - check status", async () => {
    await instance.InvestETH(0, { value: invest, from: accounts[1] }); //1-1
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),5);
  });
  it("take fee", async () => {
    let beforeBalance = await web3.eth.getBalance(instance.address);
    assert.notEqual(beforeBalance,0);
    await instance.WithdrawETHFee(accounts[0], { from: accounts[0] });
    let afterBalance = await web3.eth.getBalance(instance.address);
    assert.equal(afterBalance,0);
  });
  it("check fail attemts, open pool with no allow", async () => {
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await truffleAssert.reverts(instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,false,0,0, { from: accounts[0] }));
  });
  it("check fail attemts, send ETH to contract", async () => {
    await truffleAssert.reverts(instance.send(invest, { from: accounts[0] }));
  });
  it("Should allow send ETH", async () => {
    await instance.SwitchIsPayble({ from: accounts[0] });
    let IsPayble = await instance.IsPayble.call();
    assert.isTrue(IsPayble);
    let startBalance = await web3.eth.getBalance(instance.address);
    await instance.send(amount, { from: accounts[0] });
    let actualBalance = await web3.eth.getBalance(instance.address);
    assert.equal(actualBalance-startBalance, amount);
  });
  it("open pool in a day , check balance", async () => {
    await Token.approve(instance.address, amount, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 600, rate, rate, amount, 0, zero_address,true,Math.floor(date.getTime() / 1000) + 30,0, { from: accounts[0] });
    let newpools = await instance.poolsCount.call();
    assert.equal(newpools.toNumber(), 2, "Got 2 pools");
    let status = await instance.GetPoolStatus(1);
    assert.equal(status.toNumber(),2);
  });
});

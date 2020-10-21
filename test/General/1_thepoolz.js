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
  it("Other Payments, add as admin", async () => {
    let instance = await ThePoolz.deployed();
    let Token = await TestToken.deployed();
    let IspayableToken = await instance.IsERC20Maincoin(Token.address);
    assert.isFalse(IspayableToken);
    instance.AddERC20Maincoin(Token.address, { from: accounts[0] });
    let IspayableToken2 = await instance.IsERC20Maincoin(Token.address);
    assert.isTrue(IspayableToken2);
    instance.RemoveERC20Maincoin(Token.address, { from: accounts[0] });
    let IspayableToken3 = await instance.IsERC20Maincoin(Token.address);
    assert.isFalse(IspayableToken3);
  });
  it("set/get MinDuration", async () => {
    let instance = await ThePoolz.new();
    let min = 500;
    await instance.SetMinDuration(min, { from: accounts[0] });
    let actual = await instance.GetMinDuration();
    assert.equal(actual.toNumber(), min);
  });
  it("Set the min ETH investment", async () => {
    let instance = await ThePoolz.deployed();
    let min = web3.utils.toWei('1', 'ether');
    await instance.SetMinETH(min);
    let actual = await instance.GetMinETH();
    assert.equal(actual, min);
  });
  it("set/get fee", async () => {
    let instance = await ThePoolz.deployed();
    let fee = 35;
    await instance.SetFee(fee, { from: accounts[0] });
    let actual = await instance.GetFee();
    assert.equal(actual.toNumber(), fee);
  });
  it("set/get poz fee", async () => {
    let instance = await ThePoolz.deployed();
    let pozfee = 10;
    await instance.SetPOZFee(pozfee, { from: accounts[0] });
    let actual = await instance.GetPOZFee();
    assert.equal(actual.toNumber(), pozfee);
  });
  it("fail set poz fee", async () => {
    let instance = await ThePoolz.deployed();
    let pozfee = 40;
    truffleAssert.reverts(instance.SetPOZFee(pozfee, { from: accounts[0] }));
  });
  it("fail set fee", async () => {
    let instance = await ThePoolz.deployed();
    let fee = 10004;
    truffleAssert.reverts(instance.SetFee(fee, { from: accounts[0] }));
  });
  it("set/get poz timer", async () => {
    let instance = await ThePoolz.deployed();
    let poztimer = 2000;
    await instance.SetPozTimer(poztimer, { from: accounts[0] });
    let actual = await instance.GetPozTimer();
    assert.equal(actual.toNumber(), poztimer);
  });
  it("set/get minpoz ", async () => {
    let instance = await ThePoolz.deployed();
    let minpoz = 80000;
    await instance.SetMinPoz(minpoz, { from: accounts[0] });
    let actual = await instance.GetMinPoz();
    assert.equal(actual.toNumber(), minpoz);
  });
  /*
it("take leftovers from finish pool", async () => {
  let instance = await ThePoolz.new();
  let accounts = await web3.eth.getAccounts();
  let Token = await TestToken.new();
  let StartBalance = await Token.balanceOf(accounts[0]);
  let date = new Date();
  await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime()/1000));
  console.log("pools "+await instance.GetLastPoolId());
  await Token.approve(instance.address, amount, { from: accounts[0] });
  await instance.CreatePool(Token.address, Math.floor(date.getTime()/1000)+60, rate,rate, amount, false, zero_address, { from: accounts[0] });
  console.log("pools "+await instance.GetLastPoolId());
  await timeMachine.advanceTimeAndBlock(120*60);
  await timeMachine.advanceTimeAndBlock(120*60);
  await instance.WithdrawLeftOvers(0,{ from: accounts[0] });
  let EndBalance = await Token.balanceOf(accounts[0]);
  assert.equal(EndBalance.toNumber(),StartBalance.toNumber());
});*/ //remake test

});

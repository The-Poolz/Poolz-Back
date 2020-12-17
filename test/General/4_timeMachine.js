const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";
var BN = web3.utils.BN;
const rate = new BN('1000000000'); // with decimal21 (shifter) 1 eth^18 = 1 token^6
const amount = new BN('3000000'); //3 tokens for sale
const invest = web3.utils.toWei('1', 'ether'); //1eth;


contract("Thepoolz, with timeMachine", async accounts => {
  it("take leftovers from finish pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,true,0, { from: accounts[0] });
    let StartBalance = await Token.balanceOf(accounts[0]);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.WithdrawLeftOvers(0, { from: accounts[0] });
    let EndBalance = await Token.balanceOf(accounts[0]);
    assert.isAbove(EndBalance.toNumber(), StartBalance.toNumber());
  });
  it("Work for take leftovers on finish pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let StartBalance = await Token.balanceOf(accounts[0]);
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,true,0, { from: accounts[0] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.SafeWork();
    let EndBalance = await Token.balanceOf(accounts[0]);
    assert.equal(EndBalance.toNumber(), StartBalance.toNumber());
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),5);
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
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, zero_address,true,0, { from: accounts[0] });
    await instance.InvestETH(0, { value: invest, from: accounts[1] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.SafeWork();
    //await instance.WithdrawInvestment(0);
    let EndBalance = await Token.balanceOf(accounts[1]);
    assert.isAbove(EndBalance.toNumber(), 0);
  });
  it("Can't invest in finish pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, zero_address,true,0, { from: accounts[0] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),4);
    await truffleAssert.reverts( instance.InvestETH(0, { value: amount / 2, from: accounts[1] }));
  });
  it("Can't invest in close pool", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, zero_address,true,0, { from: accounts[0] });
    await instance.InvestETH(0, { value: invest , from: accounts[1] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    let canWork = await instance.CanWork();
    assert.isTrue(canWork);
    await instance.SafeWork();
    //let status = await instance.GetPoolStatus(0);
    //assert.equal(status.toNumber(),5);
    await truffleAssert.reverts( instance.InvestETH(0, { value: invest, from: accounts[1] }));
    let cantWork = await instance.CanWork();
    assert.isFalse(cantWork);
  });
  it("Finish Status", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, false, zero_address,true,0, { from: accounts[0] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),4);
  });
  it("Work for take leftovers and investor on finish pool, when 2 pools", async () => {
    let instance = await ThePoolz.new();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.new();
    let StartBalance = await Token.balanceOf(accounts[1]);
    assert.equal(StartBalance.toNumber(), 0);
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, 2*amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, zero_address,true,0, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 500*60, rate, rate, amount, true, zero_address,true,0, { from: accounts[0] });
    
    await instance.InvestETH(0, { value: invest, from: accounts[1] });
    await instance.InvestETH(0, { value: invest, from: accounts[1] });
    await instance.InvestETH(1, { value: invest, from: accounts[1] });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.SafeWork();
    //await instance.WithdrawInvestment(0);
    let EndBalance = await Token.balanceOf(accounts[1]);
    assert.isAbove(EndBalance.toNumber(), 0);
  });
});
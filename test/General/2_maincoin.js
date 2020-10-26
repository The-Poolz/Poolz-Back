const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

let instance, Maincoint;
contract("Thepoolz, Main Coin Test", async accounts => {
  beforeEach(async () => {
    instance = await ThePoolz.deployed();
    Maincoint = await TestMainToken.deployed();
  });
  it("mint main test token", async () => {
    let Token = await TestMainToken.deployed();
    let oldBalance = await Token.balanceOf(accounts[8]);
    assert.equal(oldBalance,0)
    await Token.FreeTest({from: accounts[8]});
    let newBalance = await Token.balanceOf(accounts[8]);
    assert.isAbove(newBalance.toNumber(),0);
  });
  it("Other Payments, add as admin", async () => {
    let IspayableToken = await instance.IsERC20Maincoin(Maincoint.address);
    assert.isFalse(IspayableToken);
    instance.AddERC20Maincoin(Maincoint.address, { from: accounts[0] });
    let IspayableToken2 = await instance.IsERC20Maincoin(Maincoint.address);
    assert.isTrue(IspayableToken2);
  });
  it("Open a pool with main coin,invest with main coin", async () => {
    let rate = 1;
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    let amount = 100000;
    let Token = await TestToken.new();
    await instance.AddERC20Maincoin(Maincoint.address, { from: accounts[0] });
    await Maincoint.transfer(accounts[1], amount, { from: accounts[0] });
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, Maincoint.address, false, { from: accounts[0] });
    let poolid = await instance.GetLastPoolId();
    assert.equal(poolid.toNumber(), 1);
    await Maincoint.approve(instance.address, amount, { from: accounts[1] });
    await instance.InvestERC20(0, amount, { from: accounts[1] });
    let afterBalance = await Token.balanceOf(instance.address);
    assert.equal(afterBalance.toNumber(), amount, "Got the Tokens minus fee");
    let beforeBalance = await Maincoint.balanceOf(instance.address);
    assert.notEqual(beforeBalance.toNumber(), 0);
  });
  it("take erc20 fee", async () => {
    await instance.WithdrawERC20Fee(Maincoint.address, accounts[0], { from: accounts[0] });
    let afterBalance = await Maincoint.balanceOf(instance.address);
    assert.equal(afterBalance.toNumber(), 0);
  });
  it("can't invest more", async () => {
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    let amount = 100000;
    await Maincoint.transfer(accounts[1], amount, { from: accounts[0] });
    await Maincoint.approve(instance.address, amount, { from: accounts[1] });
    await truffleAssert.reverts(instance.InvestERC20(0, amount, { from: accounts[1] }));
  });
  it("Get investors data", async () => {
    let data = await instance.GetInvestmentData(0, { from: accounts[1] });
    assert.isObject(data);
    //GetInvestmentData
  });
  it("Fail Get investors data", async () => {
    await truffleAssert.reverts(instance.GetInvestmentData(0, { from: accounts[2] }));
  });
  it("No work yet", async () => {
    await truffleAssert.reverts(instance.Work());
  });
  it("Get pool data", async () => {
    let data = await instance.GetPoolData(0);
    assert.isObject(data);
    let moredata = await instance.GetMorePoolData(0);
    assert.isObject(moredata);
  });
  it("Fail Open a pool with false coin", async () => {
    let rate = 1;
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    let amount = 100000;
    await truffleAssert.reverts(instance.CreatePool(accounts[7], Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, true, Maincoint.address, false, { from: accounts[0] }));
  });
});


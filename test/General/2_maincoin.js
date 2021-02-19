const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
var BN = web3.utils.BN;
const rate = new BN('1000000000000000000000'); // with decimal21 (shifter) 1 maintoken^6 = 1 token^6
const amount = new BN('3000000'); //3 tokens for sale
const invest = new BN('3000000'); //1maintoken;

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
    it("take erc20 fee", async () => {
    await instance.WithdrawERC20Fee(Maincoint.address, accounts[0], { from: accounts[0] });
    let afterBalance = await Maincoint.balanceOf(instance.address);
    assert.equal(afterBalance.toNumber(), 0);
  });
  it("can't invest more", async () => {
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await Maincoint.transfer(accounts[1], amount, { from: accounts[0] });
    await Maincoint.approve(instance.address, amount, { from: accounts[1] });
    await truffleAssert.reverts(instance.InvestERC20(0, amount*10, { from: accounts[1] }));
  });
  it("Fail Open a pool with false coin", async () => {
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    let amount = 100000;
    const futureTimestamp = Math.floor(date.getTime() / 1000) + 60
    await truffleAssert.reverts(instance.CreatePool(accounts[7], futureTimestamp, rate, rate, amount, futureTimestamp, Maincoint.address, false,0,0, { from: accounts[0] }));
  });

});


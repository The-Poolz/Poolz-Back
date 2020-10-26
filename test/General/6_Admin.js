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
  it("get PoolPrice ", async () => {
    let instance = await ThePoolz.deployed();
    let actual = await instance.GetPoolPrice();
    assert.equal(actual.toNumber(), 0);
  });
});
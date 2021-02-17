const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = 1;
const amount = 10000000;
const invest = 100000;

contract("Thepoolz Admin", async accounts => {

  it("set/get MinMaxETHInvest", async () => {
    let instance = await ThePoolz.new();
    let min = 15;
    let max = 200;
    await instance.SetMinMaxETHInvest(min,max, { from: accounts[0] });
    let actual_min = await instance.MinETHInvest.call();
    let actual_max = await instance.MaxETHInvest.call();
    assert.equal(actual_min.toNumber(), min);
    assert.equal(actual_max.toNumber(), max);
  });
  it("set/get MinMaxDuration", async () => {
    let instance = await ThePoolz.new();
    let min = 400;
    let max = 600;
    await instance.SetMinMaxDuration(min,max, { from: accounts[0] });
    let actual_min = await instance.MinDuration.call();
    let actual_max = await instance.MaxDuration.call();
    assert.equal(actual_min.toNumber(), min);
    assert.equal(actual_max.toNumber(), max);
  });
  it("set/get fee", async () => {
    let instance = await ThePoolz.deployed();
    let fee = 35;
    await instance.SetFee(fee, { from: accounts[0] });
    let actual = await instance.Fee.call();
    assert.equal(actual.toNumber(), fee);
  });
  
  it("set/get poz fee", async () => {
    let instance = await ThePoolz.deployed();
    let pozfee = 10;
    await instance.SetPOZFee(pozfee, { from: accounts[0] });
    let actual = await instance.PozFee.call();
    assert.equal(actual.toNumber(), pozfee);
  });
  
  it("set WhiteList Address", async () => {
    let instance = await ThePoolz.deployed();
    await instance.SetWhiteList_Address(accounts[4], { from: accounts[0] });    
    assert.equal(accounts[4],await instance.WhiteList_Address.call());
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
    let actual = await instance.PozTimer.call();
    assert.equal(actual.toNumber(), poztimer);
  });
  
  it("set/get minpoz ", async () => {
    let instance = await ThePoolz.deployed();
    let minpoz = 80000;
    await instance.SetMinPoz(minpoz, { from: accounts[0] });
    let actual = await instance.MinPoz.call();
    assert.equal(actual.toNumber(), minpoz);
  });
  it("get PoolPrice ", async () => {
    let instance = await ThePoolz.deployed();
    let actual = await instance.PoolPrice.call();
    assert.equal(actual.toNumber(), 0);
  });
});
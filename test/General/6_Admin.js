const ThePoolz = artifacts.require("ThePoolz");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
//const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = 1;
const amount = 10000000;
const invest = 100000;

contract("Thepoolz Admin",  accounts => {
  let ownerAddress = accounts[0], govAddress = accounts[9], whiteListAddress
  whiteListAddress = accounts[8]; // random address
  // whiteListAddress = '0xcb9950789e3673BeA38dC362aFbE02379639b21C'; // address from migrated whiteList, always update before running

  let instance

  beforeEach(async () => {
    instance = await ThePoolz.deployed();
  })

  it('set/get the Governer Contract Address', async () => {
    await instance.setGovernerContract(govAddress, {from: ownerAddress});
    const result = await instance.GovernerContract();
    assert.equal(govAddress, result);
  })

  it("set/get MinMaxETHInvest", async () => {
    let min = 15;
    let max = 200;
    await instance.SetMinMaxETHInvest(min,max, { from: govAddress });
    let actual_min = await instance.MinETHInvest.call();
    let actual_max = await instance.MaxETHInvest.call();
    assert.equal(actual_min.toNumber(), min);
    assert.equal(actual_max.toNumber(), max);
  });
  it("set/get MinMaxDuration", async () => {
    let min = 400;
    let max = 600;
    await instance.SetMinMaxDuration(min,max, { from: ownerAddress });
    let actual_min = await instance.MinDuration.call();
    let actual_max = await instance.MaxDuration.call();
    assert.equal(actual_min.toNumber(), min);
    assert.equal(actual_max.toNumber(), max);
  });
  it("set/get fee", async () => {
    let fee = 35;
    await instance.SetFee(fee, { from: ownerAddress });
    let actual = await instance.Fee.call();
    assert.equal(actual.toNumber(), fee);
  });
  it("set/get poz fee", async () => {
    let pozfee = 10;
    await instance.SetPOZFee(pozfee, { from: ownerAddress });
    let actual = await instance.PozFee.call();
    assert.equal(actual.toNumber(), pozfee);
  });
  it("set WhiteList Address", async () => {
    await instance.SetWhiteList_Address(whiteListAddress, { from: ownerAddress });    
    assert.equal(whiteListAddress, await instance.WhiteList_Address.call());
  });
  it("fail set poz fee", async () => {
    let pozfee = 40;
    truffleAssert.reverts(instance.SetPOZFee(pozfee, { from: ownerAddress }));
  });
  it("fail set fee", async () => {
    let fee = 10004;
    truffleAssert.reverts(instance.SetFee(fee, { from: ownerAddress }));
  });
  it("set/get poz timer", async () => {
    let poztimer = 2000;
    await instance.SetPozTimer(poztimer, { from: ownerAddress });
    let actual = await instance.PozTimer.call();
    assert.equal(actual.toNumber(), poztimer);
  });
  it("get PoolPrice ", async () => {
    let actual = await instance.PoolPrice.call();
    assert.equal(actual.toNumber(), 0);
  });
  it('set/get Token WhiteList ID', async () => {
    const randomId = 34
    await instance.setTokenWhitelistId(randomId, {from: ownerAddress})
    const result = await instance.TokenWhitelistId()
    assert.equal(result, randomId)
  })
  it('set/get Main coin WhiteList ID', async () => {
    const randomId = 43
    await instance.setMCWhitelistId(randomId, {from: ownerAddress})
    const result = await instance.MCWhitelistId()
    assert.equal(result, randomId)
  })
  it('set/get Benefit contract address', async () => {
    const randomAddress = accounts[7]
    await instance.SetBenefit_Address(randomAddress, {from: ownerAddress})
    const result = await instance.Benefit_Address()
    assert.equal(result, randomAddress)
  })

}); 
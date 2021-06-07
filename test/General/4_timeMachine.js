const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";
var BN = web3.utils.BN;
const rate = new BN('1000000000'); // with decimal21 (shifter) 1 eth^18 = 1 token^6
const amount = new BN('3000000'); //3 tokens for sale
const invest = web3.utils.toWei('1', 'ether'); //1eth;


contract("Thepoolz, with timeMachine", accounts => {
  let instance, Token, fromAddress = accounts[0]

  beforeEach(async () => {
    instance = await ThePoolz.new();
    Token = await TestToken.new('TestToken', 'TEST');
  })

  it("take leftovers from finish pool", async () => {
    // let instance = await ThePoolz.new();
    // let accounts = await web3.eth.getAccounts();
    // let Token = await TestToken.new();
    
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: fromAddress });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: fromAddress });
    let StartBalance = await Token.balanceOf(fromAddress);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await instance.WithdrawLeftOvers(0, { from: fromAddress });
    let EndBalance = await Token.balanceOf(fromAddress);
    assert.isAbove(EndBalance.toNumber(), StartBalance.toNumber());
  });
  it("Can't invest in finish pool", async () => {
    // let instance = await ThePoolz.new();
    // let accounts = await web3.eth.getAccounts();
    // let Token = await TestToken.new();
    let date = new Date();
    const futureTimestamp = Math.floor(date.getTime() / 1000) + 60
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: fromAddress });
    await instance.CreatePool(Token.address, futureTimestamp, rate, rate, amount, futureTimestamp, zero_address,true,0,0, { from: fromAddress });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),4);
    await truffleAssert.reverts( instance.InvestETH(0, { value: amount / 2, from: accounts[1] }));
  });
  it("Finish Status", async () => {
    // let instance = await ThePoolz.new();
    // let accounts = await web3.eth.getAccounts();
    // let Token = await TestToken.new();
    let date = new Date();
    await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000));
    await Token.approve(instance.address, amount, { from: fromAddress });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: fromAddress });
    await timeMachine.advanceTimeAndBlock(120 * 60);
    await timeMachine.advanceTimeAndBlock(120 * 60);
    let status = await instance.GetPoolStatus(0);
    assert.equal(status.toNumber(),4);
  });
});
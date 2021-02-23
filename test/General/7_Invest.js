const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
const truffleAssert = require('truffle-assertions');
const { assert } = require('chai');
var BN = web3.utils.BN;
const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

const rate = new BN('420000000000'); //1eth = 420TEST with decimal21
const amount = new BN('150000000000'); //150,000 test token
const invest = web3.utils.toWei('1', 'ether'); //1eth

contract("Thepoolz, Invest", accounts => {
  let instance, Token, fromAddress = accounts[0];

  before(async () => {
    instance = await ThePoolz.new();
    Token = await TestToken.deployed()
  });

  it("open a day long pool, check balance", async () => {
    await Token.approve(instance.address, amount, { from: fromAddress });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: fromAddress });
  });
  it("open a day long pool decimal21, invest", async () => {
    instance = await ThePoolz.new();
    await Token.approve(instance.address, amount, { from: fromAddress });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: fromAddress });
    await instance.InvestETH(0,{ value: invest, from: fromAddress });
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract.toString(), "149580000000", "Got the tokens");
  });
  it('get Total Investors', async () => {
    const result = await instance.getTotalInvestor();
    assert.isNumber(result.toNumber());
  })
  it('get Investment Data', async () => {
    const result = await instance.GetInvestmentData(0);
    assert.equal(result[1], fromAddress);
  })
  it('Fail InvestETH when invalid Pool ID is passed', async () => {
    await truffleAssert.reverts(instance.InvestETH(45,{ value: invest, from: fromAddress }));
  })
  it('InvestERC20', async () => {
    instance = await ThePoolz.new()
    let mainCoin = await TestMainToken.new()
    await Token.approve(instance.address, amount, { from: fromAddress });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await mainCoin.approve(instance.address, amount, { from: fromAddress });
    await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, mainCoin.address,true,0,0, { from: fromAddress });
    await instance.InvestERC20(0, 10000000000, {from: fromAddress})
    const result = await instance.GetInvestmentData(0)
    assert.equal(result[1], fromAddress)
  })
});

contract('Fail Invest', accounts => {
  let instance, Token, mainCoin, fromAddress = accounts[0], ethPoolId, ercPoolId

  before(async () => {
    instance = await ThePoolz.new()
    Token = await TestToken.new()
    mainCoin = await TestMainToken.new()
    await Token.approve(instance.address, amount, { from: fromAddress });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    // creating eth pool
    const tx = await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: fromAddress });
    ethPoolId = tx.logs[1].args[1].toNumber()
    await Token.approve(instance.address, amount, { from: fromAddress });
    // creating erc20 pool
    const tx2 = await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, mainCoin.address,true,0,0, { from: fromAddress });
    ercPoolId = tx2.logs[1].args[1].toNumber()
  })

  it('Fail to Invest before the start time', async () => {
    let finishDate = new Date()
    let startDate = new Date()
    finishDate.setDate(finishDate.getDate() + 2)
    startDate.setDate(startDate.getDate() + 1)
    const finishTime = Math.floor(finishDate.getTime() / 1000) // finish time is 2 days ahead
    const startTime = Math.floor(startDate.getTime() / 1000) // start time is 1 day ahead
    await Token.approve(instance.address, amount, { from: fromAddress });
    const tx = await instance.CreatePool(Token.address, finishTime, rate, rate, amount, 0, zero_address,true, startTime,0, { from: fromAddress });
    const pId = tx.logs[1].args[1].toNumber()
    await truffleAssert.reverts(instance.InvestETH(pId,{ value: invest, from: fromAddress })) // investing before start time
  })

  it('Fail InvestETH when invalid Pool ID is passed', async () => {
    await truffleAssert.reverts(instance.InvestETH(45,{ value: invest, from: fromAddress }))
  })

  it('Fail to invest ERC20 in ETH Pool', async () => {
    await truffleAssert.reverts(instance.InvestERC20(ethPoolId, amount, {from: fromAddress}))
  })

  it('Fail to invest ETH in ERC20 Pool', async () => {
    await truffleAssert.reverts(instance.InvestETH(ercPoolId, {value: invest, from: fromAddress}))
  })

  it('Fail to invest invalid amount of ERC20', async () => {
    await truffleAssert.reverts(instance.InvestERC20(ercPoolId, 1000,  {from: fromAddress}))
  })
})
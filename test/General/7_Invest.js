const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
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
  it('withdraw investment successfully', async () => {
    let date = new Date();
    date.setDate(date.getDate() + 1);
    let d = Math.floor(date.getTime() / 1000) + 60;
    await timeMachine.advanceBlockAndSetTime(d)
    const before = await instance.GetInvestmentData(0)
    console.log(before[3].toNumber())
    await instance.WithdrawInvestment(0)
    const after = await instance.GetInvestmentData(0)
    console.log(after[3].toNumber())
    const now = Date.now()
    await timeMachine.advanceBlockAndSetTime(Math.floor(now / 1000))
  })
});

// xcontract("InvestERC20 Tests", accounts => {
//   let instance, Token, mainCoin

//   before(async () => {
//     instance = await ThePoolz.new()
//     Token = await TestToken.new()
//     mainCoin = await TestMainToken.new()
//   })

//   it('creating a ERC20 pool', async () => {
//     Token = await TestToken.deployed()
//     await Token.approve(instance.address, amount, { from: accounts[0] })
//     let date = new Date();
//     date.setDate(date.getDate() + 1);   // add a day
//     await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: accounts[0] });
//     const value = await instance.poolsCount()
//     assert.equal(value.toNumber(), 1)
//   })

// })
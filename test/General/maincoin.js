
const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
const { assert } = require('chai');

let amount,invest,rate;
contract("Thepoolz, Main Coin Test", function () {
    amount = 10000000;
    invest  = 100000;
    rate = 1;
    beforeEach(async () => {
  });
  it("Other Payments, add as admin", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts()
    let Maincoint = await TestMainToken.deployed();
    let IspayableToken = await instance.IsERC20Maincoin(Maincoint.address);
    assert.isFalse(IspayableToken);
    instance.AddERC20Maincoin(Maincoint.address,{ from: accounts[0] });
    let IspayableToken2 = await instance.IsERC20Maincoin(Maincoint.address);
    assert.isTrue(IspayableToken2);
    /*instance.RemoveERC20Maincoin(Maincoint.address,{ from: accounts[0] });
    let IspayableToken3 = await instance.IsERC20Maincoin(Maincoint.address);
    assert.isFalse(IspayableToken3);*/
  });it("Open a pool with main coin,invest with main coin", async () => {
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    let amount = 100000;
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed();
    let Maincoint = await TestMainToken.deployed();
    await instance.AddERC20Maincoin(Maincoint.address,{ from: accounts[0] });
    await Maincoint.transfer(accounts[1],amount,{from: accounts[0] });
    await Token.approve(instance.address, amount, { from: accounts[0] });
    await instance.CreatePool(Token.address,Math.floor(date.getTime()/1000)+60,rate, rate,amount,false,Maincoint.address,{ from: accounts[0] });
    await Maincoint.approve(instance.address, amount, { from: accounts[1] });
    await instance.InvestERC20(0,amount,{ from: accounts[1] });
    let afterBalance = await Maincoint.balanceOf(accounts[1] ) ;
    assert.equal(afterBalance.toNumber(),0,  "Got the Tokens minus fee");
  });
  });
  
  
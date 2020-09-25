const ThePoolz = artifacts.require("Thepoolz");
const TestToken = artifacts.require("TestToken");

contract("TestToken", function () {
  it("give allownce of 121", async () => {
    const allow = 121;
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed();
    await Token.approve(accounts[0], allow, { from: accounts[8] });
    let allownce = await Token.allowance(accounts[8], accounts[0]);
    assert.equal(allownce, allow);
  });
});


contract("Thepoolz", function () {
  it("show no pools", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let mypools = await instance.GetMyPoolsId({ from: accounts[7] });
    assert.equal(mypools, 0);
  });
});


contract("Thepoolz", function () {
  const amount = 10000000000;
  it("open a day long pool, check balance", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed()
    await Token.approve(instance.address, amount, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, date.getTime(), 1, true, amount, false, { from: accounts[0] });
    let newpools = await instance.GetMyPoolsId({ from: accounts[0] });
    assert.equal(newpools.length, 1, "Got 1 pool");
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract, amount, "Got the tokens");
  });
});
  
contract("Thepoolz", function () {
  const amount = 10000000;
  const invest = 100000;
  beforeEach(async () => {

});
  it("open a day long pool, invest, check balance", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed()
    await Token.approve(instance.address, amount, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, date.getTime(), 1, true, amount, false, { from: accounts[0] });
    await instance.InvestETH(0, {value: invest, from: accounts[1]});
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract, amount-(invest/10000)*(10000+1200), "Got the tokens");
  });

  it("open a day long pool, invest, check creator balance", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed()
    await Token.approve(instance.address, amount, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address, date.getTime(), 1, true, amount, false, { from: accounts[0] });
    let beforeBalance = await web3.eth.getBalance(accounts[0] )
    await instance.InvestETH(0, {value: invest, from: accounts[1]});
    let afterBalance = await web3.eth.getBalance(accounts[0] )
    assert.isAbove(afterBalance-beforeBalance,0,  "Got the eth minus fee");
  });
});


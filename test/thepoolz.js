const ThePoolz = artifacts.require("Thepoolz");
const TestToken = artifacts.require("TestToken");
const truffleAssert = require('truffle-assertions');
const zero_address = "0x0000000000000000000000000000000000000000";


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
  const amount = 10000000;
  const invest = 100000;
  beforeEach(async () => {
});
it("show no pools", async () => {
  let instance = await ThePoolz.deployed();
  let accounts = await web3.eth.getAccounts();
  let mypools = await instance.GetMyPoolsId({ from: accounts[7] });
  assert.equal(mypools, 0);
  mypools = await instance.GetLastPoolId();
  assert.equal(mypools, 0);
});
it("open a day long pool, check balance", async () => {
  let instance = await ThePoolz.deployed();
  let accounts = await web3.eth.getAccounts();
  let Token = await TestToken.deployed()
  await Token.approve(instance.address, amount, { from: accounts[0] });
  let date = new Date();
  date.setDate(date.getDate() + 1);   // add a day
  await instance.CreatePool(Token.address, date.getTime(), 1, amount, false, zero_address, { from: accounts[0] });
  let newpools = await instance.GetMyPoolsId({ from: accounts[0] });
  assert.equal(newpools.length, 1, "Got 1 pool");
  let tokensInContract = await Token.balanceOf(instance.address);
  assert.equal(tokensInContract, amount, "Got the tokens");
});
  it("open a day long pool, invest, check balance", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed();
    await instance.InvestETH(0, {value: invest, from: accounts[1]});
    let tokensInContract = await Token.balanceOf(instance.address);
    assert.equal(tokensInContract.toNumber(), amount-(invest/10000)*(10000+1200), "Got the tokens");
  });

  it("open a day long pool, invest, check creator balance", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let beforeBalance = await web3.eth.getBalance(accounts[0] )
    await instance.InvestETH(0, {value: invest, from: accounts[1]});
    let afterBalance = await web3.eth.getBalance(accounts[0] )
    assert.isAbove(afterBalance-beforeBalance,0,  "Got the eth minus fee");
  });
it("check fail attemts, open pool with no allow", async () => {
  let instance = await ThePoolz.deployed();
  let accounts = await web3.eth.getAccounts();
  let Token = await TestToken.deployed();
  let date = new Date();
  date.setDate(date.getDate() + 1);   // add a day
  await truffleAssert.reverts(instance.CreatePool(Token.address, date.getTime(), 1, amount, false, zero_address, { from: accounts[0] }));
});
it("check fail attemts, send ETH to contract", async () => {
  let instance = await ThePoolz.deployed();
  let accounts = await web3.eth.getAccounts();
  await truffleAssert.reverts(instance.send(invest, { from: accounts[0] }));
});
it("Other Payments", async () => {
  let instance = await ThePoolz.deployed();
  let accounts = await web3.eth.getAccounts();
  let Token = await TestToken.deployed();
  let IspayableToken = await instance.IsERC20Maincoin(Token.address);
  assert.isFalse(IspayableToken);
  instance.AddERC20Maincoin(Token.address,{ from: accounts[0] });
  IspayableToken = await instance.IsERC20Maincoin(Token.address);
  assert.isTrue(IspayableToken);
  instance.RemoveERC20Maincoin(Token.address,{ from: accounts[0] });
  IspayableToken = await instance.IsERC20Maincoin(Token.address);
  assert.isFalse(IspayableToken);
});
});



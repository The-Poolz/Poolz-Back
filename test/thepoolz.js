const ThePoolz = artifacts.require("Thepoolz");
const TestToken = artifacts.require("TestToken");
const TokenAddress = '0x4b1BE4A9b196E6B3538870c784d021b4b70399c2';
const ThePoolzAddress = '0x5F5cA3034b6591dB737d2cA240dbf77B8f9f2a3e';

contract("Thepoolz", function() {
  it("give allownce of 121", async () => {
    const allow = 121;
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed();
    await Token.approve(ThePoolzAddress,allow, {from: accounts[8]});
    let allownce = await Token.allowance(accounts[8],ThePoolzAddress);
    assert.equal(allownce, allow);
  });
});



contract("Thepoolz", function() {
  it("show no pools", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let mypools = await instance.GetMyPoolsId({from: accounts[7]});
    assert.equal(mypools, 0);
  });
});


contract("Thepoolz", function() {
  it("open a day long pool, Direct trade pool", async () => {
    let instance = await ThePoolz.deployed();
    let accounts = await web3.eth.getAccounts();
    let Token = await TestToken.deployed()
    let mypools =  instance.GetMyPoolsId({from: accounts[0]});
    await Token.approve(ThePoolzAddress,10, {from: accounts[0]});
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(TokenAddress, date.getTime() ,1,true,10,false, {from: accounts[0]});
    let newpools = await instance.GetMyPoolsId({from: accounts[0]});
    assert.equal(mypools+1, newpools);
  });
});

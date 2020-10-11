const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
const { assert } = require('chai');

let instance, Maincoint;
contract("Thepoolz, POZ Test", async accounts => {
    beforeEach(async () => {
        instance = await ThePoolz.deployed();
        Maincoint = await TestMainToken.deployed();
    });
    it("Open a pool with main coin,invest with main coin", async () => {
        instance = await ThePoolz.new();
        instance.AddERC20Maincoin(Maincoint.address, { from: accounts[0] });
        let rate = 1;
        let pozrate = 2;
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        let amount = 100000;
        let Token = await TestToken.new();
        await instance.SetPozAdress(Maincoint.address, { from: accounts[0] });
        await instance.AddERC20Maincoin(Maincoint.address, { from: accounts[0] });
        await Maincoint.transfer(accounts[1], amount, { from: accounts[0] });
        await Token.approve(instance.address, amount, { from: accounts[0] });
        await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate , pozrate, amount, false, Maincoint.address, { from: accounts[0] });
        let poolid = await instance.GetLastPoolId();
        assert.equal(poolid.toNumber(), 1);
        await Maincoint.approve(instance.address, amount/2, { from: accounts[1] });
        await instance.InvestERC20(0, amount/2 , { from: accounts[1] });
        let beforeBalance = await Maincoint.balanceOf(instance.address);
        assert.notEqual(beforeBalance.toNumber(), 0);
    });
});


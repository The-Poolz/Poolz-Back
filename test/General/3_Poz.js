const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const TestMainToken = artifacts.require("TestMainToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
var BN = web3.utils.BN;
const rate = new BN('1000000000000000000000'); // with decimal21 (shifter) 1 maintoken^6 = 1 token^6
const pozrate = new BN('2000000000000000000000'); //get X2 = better
const amount = new BN('3000000'); //3 tokens for sale
const invest = new BN('1000000'); //1maintoken;

let instance, Maincoint,Token;
contract("Thepoolz, POZ Test", async accounts => {
    before(async () => {
        instance = await ThePoolz.new();
    });
    beforeEach(async () => {
        instance = await ThePoolz.deployed();
        Maincoint = await TestMainToken.deployed();
        Token = await TestToken.deployed();
    });
    it("add testtoken adress as POZ interface", async () => {   
        await instance.SetPOZBenefit_Address(Token.address);
        let address = await instance.POZBenefit_Address();
        assert.equal(address,Token.address);
        await instance.SetPOZBenefit_Address(await instance.POZ_Address());
        assert.equal(await instance.POZ_Address(),await instance.POZBenefit_Address());
      });
    it("add testtoken adress as POZ address", async () => {  
        await instance.SetPozAdress(Token.address);
        let address = await instance.POZ_Address();
        assert.equal(address,Token.address);
      });

    it("IsPoz Investort", async () => {
        let isPoz = await instance.AmIPOZInvestor({from: accounts[0]});
        assert.isTrue(isPoz);
    });
    it("Not Poz Investort", async () => {
        let isPoz = await instance.AmIPOZInvestor({from: accounts[1]});
        let address = await instance.POZ_Address();
        assert.equal(address,Token.address);
        assert.isFalse(isPoz);
    });
    it("Open a pool with main coin,invest with main coin", async () => {
        instance.AddERC20Maincoin(Maincoint.address, { from: accounts[0] });
        let date = new Date();
        date.setDate(date.getDate() + 1);   // add a day
        await instance.AddERC20Maincoin(Maincoint.address, { from: accounts[0] });
        await Maincoint.transfer(accounts[1], amount, { from: accounts[0] });
        await Token.approve(instance.address, amount, { from: accounts[0] });
        await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate , pozrate, amount, false, Maincoint.address,true,0, { from: accounts[0] });
        let poolid = await instance.GetLastPoolId();
        assert.equal(poolid.toNumber(), 1);
        await Maincoint.approve(instance.address, invest, { from: accounts[1] });
        await truffleAssert.reverts(instance.InvestERC20(0, invest/2 , { from: accounts[1] }),"Need to be POZ Holder to invest");
        await Token.transfer(accounts[1], 80, { from: accounts[0] });
        await instance.InvestERC20(0, invest/2 , { from: accounts[1] });
        let beforeBalance = await Maincoint.balanceOf(instance.address);
        assert.notEqual(beforeBalance.toNumber(), 0);
    });
});


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
    
});


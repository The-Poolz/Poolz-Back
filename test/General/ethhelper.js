const ThePoolz = artifacts.require("ThePoolz");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract("ETHHelper", function () {
    let instance ;
    let amount;
    let accounts
  
    it("Should not allow send ETH", async () => {
        amount = 10000;
        instance = await ThePoolz.new();
        accounts = await web3.eth.getAccounts();
        truffleAssert.reverts(instance.send(amount,{from: accounts[0]}) );    
    });
    it("Should allow send ETH", async () => {    
        await instance.SwitchIsPayble({from: accounts[0]});
        let IsPayble = await instance.GetIsPayble();
        assert.isTrue(IsPayble);
        await instance.send(amount,{from: accounts[0]});
        let actualBalance = await web3.eth.getBalance(instance.address);
        assert.equal(actualBalance,amount);
    });
    it("Set the min ETH investment", async () => {   
        let min = web3.utils.toWei('1', 'ether');
        await instance.SetMinETH(min);
        let actual = await instance.GetMinETH();
        assert.equal(actual,min);
    }); 
  });
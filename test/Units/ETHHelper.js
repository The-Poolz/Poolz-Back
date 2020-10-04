const ThePoolz = artifacts.require("Thepoolz");
const truffleAssert = require('truffle-assertions');
const { assert } = require('chai');

contract('ETHHelper', function(accounts) {

    let instance ;
    let amount;

    beforeEach(async ()=> {
        amount = 10000;
        instance = await ThePoolz.new();
    })

    it("Should not allow send ETH", async () => {
        truffleAssert.reverts(instance.send(amount,{from: accounts[0]}) );
    });
    it("Should allow send ETH", async () => {      
        await instance.SwitchIsPayble();
        await instance.send(amount,{from: accounts[0]});
        let expectedBalance = amount;
        let actualBalance = await web3.eth.getBalance(instance.address);
        assert.equal(actualBalance,expectedBalance);
    });
})
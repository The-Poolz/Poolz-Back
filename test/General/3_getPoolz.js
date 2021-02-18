const ThePoolz = artifacts.require("ThePoolz");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const zero_address = "0x0000000000000000000000000000000000000000";
var BN = web3.utils.BN;

const rate = new BN('1000000000'); // with decimal21 (shifter) 1 eth^18 = 1 token^6
const amount = new BN('3000000'); //3 tokens for sale
const invest = web3.utils.toWei('1', 'ether'); //1eth;

contract("Get the Poolz Data", accounts => {
    let instance, fromAddress = accounts[0]
    let Token 
    
    before(async () => {
        instance = await ThePoolz.new()
        Token = await TestToken.new()
        let date = new Date();
        date.setDate(date.getDate() + 1);
        await Token.approve(instance.address, amount, { from: accounts[0] });
        await instance.CreatePool(Token.address, Math.floor(date.getTime() / 1000) + 60, rate, rate, amount, 0, zero_address,true,0,0, { from: fromAddress });
    })


    it('Get Pools IDs of msg.sender', async () => {
        const result = await instance.GetMyPoolsId({from: fromAddress})
        const value = await instance.poolsCount()
        assert.equal(value.toNumber(), 1)
        assert.equal(result.length, 1)
    })

    it('Get Pools Base Data', async () => {
        const result = await instance.GetPoolBaseData(0)
        const tokenAddress = result[0]
        assert.equal(tokenAddress, Token.address)
    })

    it('Get Pools More Data', async () => {
        const result = await instance.GetPoolMoreData(0)
        const leftToken = result[1]
        assert.equal(leftToken.toNumber(), amount.toNumber())
    })

    it('Get Pools Extra Data', async () => {
        const result = await instance.GetPoolExtraData(0)
        const tookLeftOver = result[0]
        assert.isFalse(tookLeftOver)
    })

})
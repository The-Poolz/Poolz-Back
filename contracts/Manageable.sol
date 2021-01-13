// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./ETHHelper.sol";

contract Manageable is ETHHelper {
    constructor() public {
        Fee = 20; // *10000
        MinDuration = 0; //need to set
        PoolPrice = 0; // Price for create a pool
        MaxDuration = 60 * 60 * 24 * 30 * 6; // half year
        MinETHInvest = 10000; // for percent calc
        MaxETHInvest = 100 * 10**18; // 100 eth per wallet
    }

    mapping(address => uint256) FeeMap;
    //@dev for percent use uint16
    uint256 internal Fee; //the fee for the pool
    uint256 internal MinDuration; //the minimum duration of a pool, in seconds
    uint256 internal MaxDuration; //the maximum duration of a pool from the creation, in seconds
    uint256 internal PoolPrice;
    uint256 internal MinETHInvest;
    uint256 internal MaxETHInvest;

    function SetMinMaxETHInvest(uint256 _MinETHInvest, uint256 _MaxETHInvest)
        public
        onlyOwner
    {
        MinETHInvest = _MinETHInvest;
        MaxETHInvest = _MaxETHInvest;
    }
    function GetMinMaxETHInvest() public view returns (uint256 _MinETHInvest, uint256 _MaxETHInvest)
    {
       return (MinETHInvest,MaxETHInvest);
    }

    function GetMinMaxDuration() public view returns (uint256, uint256) {
        return (MinDuration, MaxDuration);
    }

    function SetMinMaxDuration(uint256 _minDuration, uint256 _maxDuration)
        public
        onlyOwner
    {
        MinDuration = _minDuration;
        MaxDuration = _maxDuration;
    }

    function GetPoolPrice() public view returns (uint256) {
        return PoolPrice;
    }

    function SetPoolPrice(uint256 _PoolPrice) public onlyOwner {
        PoolPrice = _PoolPrice;
    }

    function GetFee() public view returns (uint256) {
        return Fee;
    }

    function SetFee(uint256 _fee)
        public
        onlyOwner
        PercentCheckOk(_fee)
        LeftIsBigger(_fee, PozFee)
    {
        Fee = _fee;
    }

    function SetPOZFee(uint256 _fee)
        public
        onlyOwner
        PercentCheckOk(_fee)
        LeftIsBigger(Fee, _fee)
    {
        PozFee = _fee;
    }

    function WithdrawETHFee(address _to) public onlyOwner {
        _to.transfer(address(this).balance); // keeps only fee eth on contract //To Do need to take 16% to burn!!!
    }

    function WithdrawERC20Fee(address _Token, address _to) public onlyOwner {
        uint256 temp = FeeMap[_Token];
        FeeMap[_Token] = 0;
        TransferToken(_Token, _to, temp);
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./ETHHelper.sol";

contract Manageable is ETHHelper {
    constructor() public {
        Fee = 20; // *10000
        //MinDuration = 0; //need to set
        //PoolPrice = 0; // Price for create a pool
        MaxDuration = 60 * 60 * 24 * 30 * 6; // half year
        MinETHInvest = 10000; // for percent calc
        MaxETHInvest = 100 * 10**18; // 100 eth per wallet
        //WhiteList_Address = address(0x0);
    }

    mapping(address => uint256) FeeMap;
    //@dev for percent use uint16
    uint256 public Fee; //the fee for the pool
    uint256 public MinDuration; //the minimum duration of a pool, in seconds
    uint256 public MaxDuration; //the maximum duration of a pool from the creation, in seconds
    uint256 public PoolPrice;
    uint256 public MinETHInvest;
    uint256 public MaxETHInvest;
    address public WhiteList_Address; //The address of the Whitelist contract
    bool public MustPozBenefit;
    
    function SwitchMustPozBenefit() public onlyOwner {
        MustPozBenefit = !MustPozBenefit;
    }

    function SetWhiteList_Address(address _WhiteList_Address) public onlyOwner {
        WhiteList_Address = _WhiteList_Address;
    }

    function SetMinMaxETHInvest(uint256 _MinETHInvest, uint256 _MaxETHInvest)
        public
        onlyOwner
    {
        MinETHInvest = _MinETHInvest;
        MaxETHInvest = _MaxETHInvest;
    }

    function SetMinMaxDuration(uint256 _minDuration, uint256 _maxDuration)
        public
        onlyOwner
    {
        MinDuration = _minDuration;
        MaxDuration = _maxDuration;
    }

    function SetPoolPrice(uint256 _PoolPrice) public onlyOwner {
        PoolPrice = _PoolPrice;
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

// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./ETHHelper.sol";
import "./IWhiteList.sol";

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

    bool public IsTokenFilterOn;
    uint256 public TokenWhitelistId;
    uint256 public MCWhitelistId; // Main Coin WhiteList ID

    function SwapTokenFilter() public onlyOwner {
        IsTokenFilterOn = !IsTokenFilterOn;
    }

    function setTokenWhitelistId(uint256 _whiteListId) external onlyOwnerOrGov{
        TokenWhitelistId = _whiteListId;
    }

    function setMCWhitelistId(uint256 _whiteListId) external onlyOwnerOrGov{
        MCWhitelistId = _whiteListId;
    }

    function IsValidToken(address _address) public view returns (bool) {
        return !IsTokenFilterOn || (IWhiteList(WhiteList_Address).Check(_address, TokenWhitelistId) > 0);
    }

    function IsERC20Maincoin(address _token) public view returns (bool) {
        return IWhiteList(WhiteList_Address).Check(_token, MCWhitelistId) > 0;
    }
    
    function SetWhiteList_Address(address _WhiteList_Address) public onlyOwnerOrGov {
        WhiteList_Address = _WhiteList_Address;
    }

    function SetMinMaxETHInvest(uint256 _MinETHInvest, uint256 _MaxETHInvest)
        public
        onlyOwnerOrGov
    {
        MinETHInvest = _MinETHInvest;
        MaxETHInvest = _MaxETHInvest;
    }

    function SetMinMaxDuration(uint256 _minDuration, uint256 _maxDuration)
        public
        onlyOwnerOrGov
    {
        MinDuration = _minDuration;
        MaxDuration = _maxDuration;
    }

    function SetPoolPrice(uint256 _PoolPrice) public onlyOwnerOrGov {
        PoolPrice = _PoolPrice;
    }

    function SetFee(uint256 _fee)
        public
        onlyOwnerOrGov
        PercentCheckOk(_fee)
        LeftIsBigger(_fee, PozFee)
    {
        Fee = _fee;
    }

    function SetPOZFee(uint256 _fee)
        public
        onlyOwnerOrGov
        PercentCheckOk(_fee)
        LeftIsBigger(Fee, _fee)
    {
        PozFee = _fee;
    }

    
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./ETHHelper.sol";

contract Managable is ETHHelper {
    constructor() public {
        Fee = 20; // *10000
        MinDuration = 0; //need to set
    }
    mapping (address => uint256) FeeMap;
    //@dev for percent use uint16
    uint16 internal Fee; //the fee for the pool
    uint16 internal MinDuration; //the minimum duration of a pool, in seconds

    function TimerCheckOk() internal view returns (bool) {
        return PozTimer < 10000;
    }

    function GetMinDuration() public view returns (uint16) {
        return MinDuration;
    }

    function SetMinDuration(uint16 _minDuration) public onlyOwner {
        MinDuration = _minDuration;
    }
        function GetFee() public view returns (uint16) {
        return Fee;
    }

    function SetFee(uint16 _fee) public onlyOwner {
        Fee = _fee;
    }

    function SetPOZFee(uint16 _fee)
        public
        onlyOwner
        PercentCheckOk(_fee)
        LeftIsBigger(_fee, Fee)
    {
        PozFee = _fee;
    }

    function WithdrawETHFee(address _to) public onlyOwner {
        _to.transfer(address(this).balance); // keeps only fee eth on contract //To Do need to take 16% to burn!!!
    }

    function WithdrawERC20Fee(address _Token, address _to) public onlyOwner {    
        ERC20(_Token).transfer(_to, FeeMap[_Token]);
        FeeMap[_Token] = 0 ;
    }
}

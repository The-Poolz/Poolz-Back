// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./POZBenefit.sol";

contract Managable is Pausable, POZBenefit {
    constructor() public {
        Fee = 20; // *10000
        PozFee = 15; // *10000
        PozTimer = 1000; // *10000
        MinPoz = 80; // ^Token.decimals
        MinDuration = 0; //need to set
    }
    //@dev for percent use uint16, for time use uint32 (until February 7, 2106 6:28:15 AM)
    address internal Admin; //only admin can change the global settings
    //Global settings
    uint16 internal Fee; //the fee for the pool
    uint16 internal PozFee; // the fee for the first part of the pool
    uint16 internal PozTimer; //the timer for the first part fo the pool
    //uint256 public PozDiscount; // The discout the first part of the pool got //*Moved inside the Pool, can select on create */
    //address FeeWallet; //keep in contract //the wallet getting the fee
    uint256 internal MinPoz; //minimum ammount ofpoz to be part of the discount
    uint16 internal MinDuration; //the minimum duration of a pool, in seconds
    function FeeCheckOk() internal view returns (bool) {
        return Fee > PozFee;
    }
    function TimerCheckOk() internal view returns (bool) {
        return PozTimer > 0 && PozTimer <10000;
    }
    function GetPozTimer() public view returns (uint16) {
        return PozTimer;
    }

    function SetPozTimer(uint16 _pozTimer) public onlyOwner {
        PozTimer = _pozTimer;
        if (!TimerCheckOk()) revert("Poz Timer needto be in 0 < PozTimer < 10000");
    }

    function GetFee() public view returns (uint16) {
        return Fee;
    }

    function SetFee(uint16 _fee) public onlyOwner {
        Fee = _fee;
        if (!FeeCheckOk()) revert("Fee MUST be higher then POZ Fee");
    }

    function GetPOZFee() public view returns (uint16) {
        return PozFee;
    }

    function SetPOZFee(uint16 _fee) public onlyOwner {
        PozFee = _fee;
        if (!FeeCheckOk()) revert("Fee MUST be higher then POZ Fee");
    }

    function WithdrawETHFee(address _to) public onlyOwner {
        _to.transfer(address(this).balance); // keeps only fee eth on contract //To Do need to take 16% to burn!!!
    }

    function WithdrawERC20Fee(address _Token, address _to) public onlyOwner {
        ERC20(_Token).transfer(_to, ERC20(_Token).balanceOf(address(this)));
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./ERC20Helper.sol";
import "./IPozBenefit.sol";

contract PozBenefit is Pausable, ERC20Helper {
    constructor() public {
        PozFee = 15; // *10000
        PozTimer = 1000; // *10000
        MinPoz = 80; // ^Token.decimals
        POZ_Address = address(0x0);
    }

    uint16 internal PozFee; // the fee for the first part of the pool
    uint16 internal PozTimer; //the timer for the first part fo the pool
    uint256 internal MinPoz; //minimum ammount ofpoz to be part of the discount
    address internal POZ_Address; //The address of the POZ Token

    modifier PercentCheckOk(uint16 _percent) {
        if (_percent < 10000) _;
    }
    modifier LeftIsBigger(uint16 _left, uint16 _right){
        if(_left > _right) _;
    }

    function GetPozTimer() public view returns (uint16) {
        return PozTimer;
    }

    function SetPozTimer(uint16 _pozTimer)
        public
        onlyOwner
        PercentCheckOk(_pozTimer)
    {
        PozTimer = _pozTimer;
    }

    function GetPOZFee() public view returns (uint16) {
        return PozFee;
    }

    function GetMinPoz() public view returns (uint256) {
        return MinPoz;
    }

    function SetMinPoz(uint256 _MinPoz) public onlyOwner {
        MinPoz = _MinPoz;
    }
    //@dev Taken from interface, To join the POZ Benefit club
    function IsPOZInvestor(address _investor) internal view returns (bool) {
        if (POZ_Address == address(0x0)) return true;//false; // for testing stage, until got the address
        return (CheckBalance(POZ_Address,_investor) >= MinPoz || IPOZBenefit(POZ_Address).IsPOZHolder(_investor));
    }
}

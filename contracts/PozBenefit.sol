// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./ERC20Helper.sol";
import "./IPozBenefit.sol";

contract PozBenefit is ERC20Helper {
    constructor() public {
        PozFee = 15; // *10000
        PozTimer = 1000; // *10000
        MinPoz = 80; // ^Token.decimals
        POZ_Address = address(0x0);
        POZBenefit_Address = address(0x0);
    }

    uint256 internal PozFee; // the fee for the first part of the pool
    uint256 internal PozTimer; //the timer for the first part fo the pool
    uint256 internal MinPoz; //minimum ammount ofpoz to be part of the discount
    address public POZ_Address; //The address of the POZ Token
    address public POZBenefit_Address; //the address for implementation of IPozBenefit - to get POZ benefit status from other contracts

    modifier PercentCheckOk(uint256 _percent) {
        if (_percent < 10000) _;
        else revert("Not in range");
    }
    modifier LeftIsBigger(uint256 _left, uint256 _right) {
        if (_left > _right) _;
        else revert("Not bigger");
    }

    function GetPozTimer() public view returns (uint256) {
        return PozTimer;
    }

    function SetPozTimer(uint256 _pozTimer)
        public
        onlyOwner
        PercentCheckOk(_pozTimer)
    {
        PozTimer = _pozTimer;
    }

    function GetPOZFee() public view returns (uint256) {
        return PozFee;
    }

    function GetMinPoz() public view returns (uint256) {
        return MinPoz;
    }

    function SetMinPoz(uint256 _MinPoz) public onlyOwner {
        MinPoz = _MinPoz;
    }

    function SetPOZBenefit_Address(address _POZBenefit_Address)
        public
        onlyOwner
    {
        POZBenefit_Address = _POZBenefit_Address;
    }

    function SetPozAdress(address _POZ_Address) public onlyOwner {
        POZ_Address = _POZ_Address;
    }

    function AmIPOZInvestor() public view returns (bool) {
        return IsPOZInvestor(msg.sender);
    }

    //@dev Taken from interface, To join the POZ Benefit club
    function IsPOZInvestor(address _investor) internal view returns (bool) {
        if (POZ_Address == address(0x0) && POZBenefit_Address == address(0x0)) return true; //false; // for testing stage, until got the address
        return ((POZ_Address != address(0x0) &&
            CheckBalance(POZ_Address, _investor) >= MinPoz) ||
            (POZBenefit_Address != address(0x0) &&
                IPOZBenefit(POZBenefit_Address).IsPOZHolder(_investor)));
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./ERC20Helper.sol";
import "./IPozBenefit.sol";

contract PozBenefit is ERC20Helper {
    constructor() public {
        PozFee = 15; // *10000
        PozTimer = 1000; // *10000
    
       // POZ_Address = address(0x0);
       // POZBenefit_Address = address(0x0);
    }

    uint256 public PozFee; // the fee for the first part of the pool
    uint256 public PozTimer; //the timer for the first part fo the pool
    
    modifier PercentCheckOk(uint256 _percent) {
        if (_percent < 10000) _;
        else revert("Not in range");
    }
    modifier LeftIsBigger(uint256 _left, uint256 _right) {
        if (_left > _right) _;
        else revert("Not bigger");
    }

    function SetPozTimer(uint256 _pozTimer)
        public
        onlyOwnerOrGov
        PercentCheckOk(_pozTimer)
    {
        PozTimer = _pozTimer;
    }

    
}

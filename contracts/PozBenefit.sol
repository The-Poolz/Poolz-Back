// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

contract POZBenefit{
        constructor() public {
        PozFee = 15; // *10000
        PozTimer = 1000; // *10000
        MinPoz = 80; // ^Token.decimals     
    }
    uint16 internal PozFee; // the fee for the first part of the pool
    uint16 internal PozTimer; //the timer for the first part fo the pool
    uint256 internal MinPoz; //minimum ammount ofpoz to be part of the discount
}
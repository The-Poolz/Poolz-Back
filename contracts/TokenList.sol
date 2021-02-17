// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./IWhiteList.sol";

contract TokenList is Pausable {
    bool public IsTokenFilterOn;
    //uint256 public NumberOfTokens;
    //mapping(address => bool) private _IsAllowed;
    //mapping(uint256 => address) private _Tokens;
    address public WhitelistContract;
    uint256 public WhitelistID;

    constructor() public {
       // NumberOfTokens = 0;
       // IsTokenFilterOn = false; //true on prod
    }

    function SwapTokenFilter() public onlyOwner {
         IsTokenFilterOn = !IsTokenFilterOn;
    }

    function IsValidToken(address _address) public view returns (bool) {
        return !IsTokenFilterOn || (IWhiteList(WhitelistContract).Check(_address, WhitelistID) > 0);
    }
}

// no addToken or removeToken
// modify isValiedToken to use whitelist interface and call check()
//

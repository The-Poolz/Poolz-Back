// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract TokenList is Pausable {
    bool public IsTokenFilterOn;
    uint256 public NumberOfTokens;
    mapping(address => bool) private _IsAllowed;
    mapping(uint256 => address) private _Tokens;

    constructor() public {
        NumberOfTokens = 0;
        IsTokenFilterOn = false; //true on prod
    }

    function SwapTokenFilter() public onlyOwner {
        IsTokenFilterOn = !IsTokenFilterOn;
    }

    function AddToken(address _address) public onlyOwner {
        require(!_IsAllowed[_address], "This Token in List");
        _IsAllowed[_address] = true;
        _Tokens[NumberOfTokens] = _address;
        NumberOfTokens++;
    }

    function RemoveToken(address _address) public onlyOwner {
        require(_IsAllowed[_address], "This Token not in List");
        _IsAllowed[_address] = false;
    }

    function IsValidToken(address _address) public view returns (bool) {
        return !IsTokenFilterOn || _IsAllowed[_address];
    }
}

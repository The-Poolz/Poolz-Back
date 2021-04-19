// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

//For whitelist, 
interface IWhiteList {
    function Check(address _Subject, uint256 _Id) external view returns(uint);
    function Register(address _Subject,uint256 _Id,uint256 _Amount) external;
    function IsNeedRegister(uint256 _Id) external view returns(bool);
}

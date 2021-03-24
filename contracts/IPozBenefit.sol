// SPDX-License-Identifier: MIT

pragma solidity >=0.4.24 <0.7.0;

//True POZ Token will have this, 
interface IPOZBenefit {
    function IsPOZHolder(address _Subject) external view returns(bool);
}

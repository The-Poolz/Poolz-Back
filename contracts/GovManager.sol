// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract GovManager is Pausable {
    address public GovernerContract;

    modifier onlyOwnerOrGov() {
        require(msg.sender == owner || msg.sender == GovernerContract, "Authorization Error");
        _;
    }

    function setGovernerContract(address _address) external onlyOwnerOrGov{
        GovernerContract = _address;
    }

    constructor() public {
        GovernerContract = address(0);
    }
}